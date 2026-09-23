import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  colorAlpha,
  configSecondary,
  primaryColor,
} from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { DocumentSVG } from '../assets/svg/DocumentSVG';
import { DoubleTickSVG } from '../assets/svg/DoubleTickSVG';
import { HeadphonesSVG } from '../assets/svg/HeadphonesSVG';
import { MicSVG } from '../assets/svg/MicSVG';
import { ViewOnceSVG } from '../assets/svg/ViewOnceSVG';
import { formatDate, formatDuration } from '../Helpers/helper';
import type { Attachment, Message } from '../types/inputTypes';
import { StickerView } from './StickerView';
import { BUBBLE_PRIMARY_COLOR } from '../utils/colors';

const IMAGE_WIDTH = 220;
const STICKER_SIZE = 140;
const TAIL_SIZE = 10;
const MUTED = colorAlpha('#000000').shade40;

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const formatClock = (date: Date) =>
  `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const fileLabel = ({ name, mimeType, size }: Attachment) => {
  const extension = name.includes('.')
    ? name.split('.').pop()
    : mimeType?.split('/').pop();
  return [extension?.toUpperCase(), formatBytes(size)]
    .filter(Boolean)
    .join(' · ');
};

const ViewOnceChip = ({
  opened,
  onPress,
}: {
  opened?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    accessibilityLabel={opened ? 'Opened view once photo' : 'View once photo'}
    disabled={opened || !onPress}
    onPress={onPress}
    style={[themeStyles.flexRow, themeStyles.flexNullCenter, styles.viewOnce]}>
    <ViewOnceSVG
      width={22}
      height={22}
      filled={!opened}
      color={opened ? MUTED : primaryColor}
    />
    <Text style={[styles.text, opened && styles.viewOnceOpened]}>
      {opened ? 'Opened' : 'Photo'}
    </Text>
  </TouchableOpacity>
);

const AttachmentView = ({
  attachment,
  onPress,
}: {
  attachment: Attachment;
  onPress?: () => void;
}) => {
  if (attachment.kind === 'image') {
    const ratio =
      attachment.width && attachment.height
        ? attachment.height / attachment.width
        : 1;
    return (
      <TouchableOpacity
        accessibilityLabel="Open photo"
        disabled={!onPress}
        onPress={onPress}
        activeOpacity={0.85}>
        <Image
          source={{ uri: attachment.uri }}
          style={[
            styles.image,
            { height: Math.min(Math.max(IMAGE_WIDTH * ratio, 120), 320) },
          ]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  const Icon = attachment.kind === 'audio' ? HeadphonesSVG : DocumentSVG;
  return (
    <View
      style={[
        themeStyles.flexRow,
        themeStyles.flexNullCenter,
        styles.fileCard,
      ]}>
      <Icon width={26} height={26} color={configSecondary} />
      <View style={themeStyles.flex1}>
        <Text numberOfLines={1} style={styles.fileName}>
          {attachment.name}
        </Text>
        {!!fileLabel(attachment) && (
          <Text style={styles.fileMeta}>{fileLabel(attachment)}</Text>
        )}
      </View>
    </View>
  );
};

interface MessageBubbleProps {
  message: Message;
  prevMessage?: Message;
  onOpenMedia?: (message: Message) => void;
}

/**
 * Chat bubble styled after the uchat MessageItem: tail on the first message
 * of a group, date pill when the day changes, time + ticks for sent messages
 */
export const MessageBubble = memo(
  ({ message, prevMessage, onOpenMedia }: MessageBubbleProps) => {
    const fromMe = message.fromMe !== false;
    const newDay =
      !prevMessage || !isSameDay(prevMessage.timestamp, message.timestamp);
    const firstInGroup = newDay || (prevMessage?.fromMe !== false) !== fromMe;
    const bubbleColor = fromMe ? BUBBLE_PRIMARY_COLOR : 'white';

    const renderBody = () => {
      if (message.type === 'voice') {
        return (
          <View
            style={[
              themeStyles.flexRow,
              themeStyles.flexNullCenter,
              themeStyles.gap5,
            ]}>
            <MicSVG width={20} height={20} color={configSecondary} />
            <Text style={styles.text}>
              Voice message · {formatDuration(message.duration ?? 0)}
            </Text>
          </View>
        );
      }
      return (
        <>
          {message.attachment &&
            (message.viewOnce ? (
              <ViewOnceChip
                opened={message.viewOnceOpened}
                onPress={onOpenMedia && (() => onOpenMedia(message))}
              />
            ) : (
              <AttachmentView
                attachment={message.attachment}
                onPress={onOpenMedia && (() => onOpenMedia(message))}
              />
            ))}
          {!!message.text && <Text style={styles.text}>{message.text}</Text>}
        </>
      );
    };

    const datePill = newDay && (
      <Text style={styles.datePill}>{formatDate(message.timestamp)}</Text>
    );

    // Stickers float without a bubble, like WhatsApp
    if (message.type === 'sticker' && message.sticker) {
      return (
        <View>
          {datePill}
          <View
            style={[
              styles.stickerRow,
              fromMe ? styles.rowMine : styles.rowTheirs,
              firstInGroup && styles.rowFirst,
            ]}>
            <StickerView sticker={message.sticker} size={STICKER_SIZE} />
            <View
              style={[
                themeStyles.flexRow,
                themeStyles.flexNullCenter,
                styles.meta,
                styles.stickerMeta,
              ]}>
              <Text style={styles.time}>{formatClock(message.timestamp)}</Text>
              {fromMe && <DoubleTickSVG width={15} height={15} color={MUTED} />}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View>
        {newDay && (
          <Text style={styles.datePill}>{formatDate(message.timestamp)}</Text>
        )}
        <View
          style={[
            themeStyles.flexRow,
            styles.row,
            fromMe ? styles.rowMine : styles.rowTheirs,
            firstInGroup && styles.rowFirst,
          ]}>
          {!fromMe && firstInGroup && (
            <View style={[styles.tail, { borderRightColor: bubbleColor }]} />
          )}
          <View
            style={[
              styles.bubble,
              { backgroundColor: bubbleColor },
              message.attachment && !message.viewOnce && styles.bubbleWithMedia,
              firstInGroup &&
                (fromMe ? styles.bubbleMineFirst : styles.bubbleTheirsFirst),
              !firstInGroup &&
                (fromMe ? styles.indentMine : styles.indentTheirs),
            ]}>
            {renderBody()}
            <View
              style={[
                themeStyles.flexRow,
                themeStyles.flexNullCenter,
                styles.meta,
              ]}>
              <Text style={styles.time}>{formatClock(message.timestamp)}</Text>
              {fromMe && <DoubleTickSVG width={15} height={15} color={MUTED} />}
            </View>
          </View>
          {fromMe && firstInGroup && (
            <View
              style={[
                styles.tail,
                styles.tailMine,
                { borderRightColor: bubbleColor },
              ]}
            />
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  datePill: {
    alignSelf: 'center',
    backgroundColor: 'white',
    color: colorAlpha('#000000').shade70,
    fontWeight: 'bold',
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 1,
  },
  stickerRow: {
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  stickerMeta: {
    marginTop: -6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  row: {
    paddingHorizontal: 10,
    marginTop: 2,
  },
  rowFirst: {
    marginTop: 8,
  },
  rowMine: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  // Same triangle as MessageItem's arrowStyle
  tail: {
    width: 0,
    height: 0,
    borderBottomWidth: TAIL_SIZE,
    borderRightWidth: TAIL_SIZE,
    borderBottomColor: 'transparent',
    borderRightColor: 'white',
    marginRight: -1,
  },
  tailMine: {
    marginRight: 0,
    marginLeft: -1,
    transform: [{ rotate: '-90deg' }],
  },
  bubble: {
    flexShrink: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bubbleWithMedia: {
    padding: 4,
  },
  bubbleMineFirst: {
    borderTopEndRadius: 0,
  },
  bubbleTheirsFirst: {
    borderTopStartRadius: 0,
  },
  indentMine: {
    marginRight: TAIL_SIZE - 1,
  },
  indentTheirs: {
    marginLeft: TAIL_SIZE - 1,
  },
  text: {
    fontSize: 16,
    color: 'black',
    paddingHorizontal: 2,
  },
  meta: {
    alignSelf: 'flex-end',
    gap: 3,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  time: {
    fontSize: 11,
    color: MUTED,
  },
  viewOnce: {
    gap: 6,
    paddingVertical: 4,
    paddingRight: 24,
  },
  viewOnceOpened: {
    color: MUTED,
    fontStyle: 'italic',
  },
  image: {
    width: IMAGE_WIDTH,
    borderRadius: 8,
  },
  fileCard: {
    width: IMAGE_WIDTH,
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colorAlpha('#000000').shade5,
  },
  fileName: {
    fontSize: 15,
    color: 'black',
  },
  fileMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
});
