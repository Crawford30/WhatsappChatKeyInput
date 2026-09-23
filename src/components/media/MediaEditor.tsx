import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { primaryColor } from '../../assets/style/Colors';
import { styles as themeStyles } from '../../assets/style/Styles';
import { CloseSVG } from '../../assets/svg/CloseSVG';
import { CropRotateSVG } from '../../assets/svg/CropRotateSVG';
import { EmojiSVG } from '../../assets/svg/EmojiSVG';
import { PencilSVG } from '../../assets/svg/PencilSVG';
import { RotateSVG } from '../../assets/svg/RotateSVG';
import { SendSVG } from '../../assets/svg/SendSVG';
import { TrashSVG } from '../../assets/svg/TrashSVG';
import { UndoSVG } from '../../assets/svg/UndoSVG';
import { ViewOnceSVG } from '../../assets/svg/ViewOnceSVG';
import {
  canvasToImage,
  computeLayout,
  CropRect,
  FULL_CROP,
  nextRotation,
  Rotation,
  rotateCropClockwise,
  Size,
} from '../../Helpers/imageEditGeometry';
import type { Attachment } from '../../types/inputTypes';
import { EmojiPicker } from '../EmojiPicker';
import { CropOverlay } from './CropOverlay';
import { EditCanvas } from './EditCanvas';
import {
  EDITOR_COLORS,
  hasPixelEdits,
  ImageEdit,
  newEdit,
  Overlay,
  Stroke,
} from './editorTypes';
import { ColorSwatches, TextOverlayEditor } from './TextOverlayEditor';

type Mode = 'view' | 'draw' | 'crop' | 'text' | 'emoji';

const PEN_WIDTH = 6;
const TEXT_SIZE = 0.09;
const EMOJI_SIZE = 0.2;
// Dragging a sticker below this distance from the bottom deletes it
const TRASH_ZONE = 150;
const THUMB_SIZE = 52;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const nextFrame = () => new Promise(requestAnimationFrame);

export interface EditedImage {
  attachment: Attachment;
  caption: string;
}

interface MediaEditorProps {
  images: Attachment[];
  initialCaption?: string;
  recipientName: string;
  onClose: () => void;
  onSend: (items: EditedImage[], viewOnce: boolean) => void;
}

const RoundButton = ({
  label,
  onPress,
  children,
  active,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <TouchableOpacity
    accessibilityLabel={label}
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      themeStyles.flexCenter,
      styles.roundButton,
      active && styles.roundButtonActive,
    ]}>
    {children}
  </TouchableOpacity>
);

/**
 * WhatsApp-style preview/editor for picked photos: crop & rotate, draw,
 * text, emoji stickers, per-photo captions and "view once".
 * Render it only while there are images to edit.
 */
export const MediaEditor: React.FC<MediaEditorProps> = ({
  images,
  initialCaption = '',
  recipientName,
  onClose,
  onSend,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [edits, setEdits] = useState<ImageEdit[]>(() =>
    images.map((image, i) =>
      newEdit(
        { width: image.width || 1, height: image.height || 1 },
        i === 0 ? initialCaption : ''
      )
    )
  );
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('view');
  const [drawColor, setDrawColor] = useState(EDITOR_COLORS[2]);
  const [cropDraft, setCropDraft] = useState<{
    rotation: Rotation;
    crop: CropRect;
  } | null>(null);
  const [textDraft, setTextDraft] = useState<{
    id?: number;
    value: string;
    color: string;
  } | null>(null);
  const [drag, setDrag] = useState({ dragging: false, overTrash: false });
  const [viewOnce, setViewOnce] = useState(false);
  const [area, setArea] = useState<Size | null>(null);
  const [exporting, setExporting] = useState(false);

  const nextId = useRef(1);
  const canvasRef = useRef<View>(null);
  const loadedUri = useRef<string | null>(null);
  const editsRef = useRef(edits);
  editsRef.current = edits;

  const image = images[index];
  const edit = edits[index];

  const updateEdit = useCallback(
    (update: (current: ImageEdit) => ImageEdit, at = index) =>
      setEdits(prev => prev.map((e, i) => (i === at ? update(e) : e))),
    [index]
  );

  // Picker sizes can be missing; fall back to the file's real size
  useEffect(() => {
    images.forEach((item, i) => {
      if (item.width && item.height) return;
      Image.getSize(item.uri, (width, height) =>
        updateEdit(e => ({ ...e, size: { width, height } }), i)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const handleImageLoad = useCallback(
    (size: Size) => {
      loadedUri.current = image.uri;
      // Trust the decoded size when the picker's disagrees (EXIF rotation)
      const current = edit.size;
      if (
        size.width &&
        size.height &&
        Math.abs(size.width / size.height - current.width / current.height) >
          0.02
      ) {
        updateEdit(e => ({ ...e, size }));
      }
    },
    [image.uri, edit.size, updateEdit]
  );

  // ---- overlays (text + emoji) ----------------------------------------

  const visibleCentre = () => {
    if (!area) return { x: 0.5, y: 0.5 };
    const layout = computeLayout(edit.size, edit.rotation, edit.crop, area);
    return canvasToImage(
      { x: layout.canvasWidth / 2, y: layout.canvasHeight / 2 },
      layout,
      edit.rotation
    );
  };

  const addOverlay = (overlay: Omit<Overlay, 'id' | 'x' | 'y'>) => {
    const centre = visibleCentre();
    const id = nextId.current++;
    updateEdit(e => ({
      ...e,
      overlays: [...e.overlays, { ...overlay, id, x: centre.x, y: centre.y }],
    }));
  };

  const changeOverlay = useCallback(
    (id: number, patch: Partial<Overlay>) =>
      updateEdit(e => ({
        ...e,
        overlays: e.overlays.map(o => (o.id === id ? { ...o, ...patch } : o)),
      })),
    [updateEdit]
  );

  const deleteOverlay = useCallback(
    (id: number) =>
      updateEdit(e => ({
        ...e,
        overlays: e.overlays.filter(o => o.id !== id),
      })),
    [updateEdit]
  );

  const finishText = (value: string, color: string) => {
    const draft = textDraft;
    setTextDraft(null);
    setMode('view');
    if (!draft) return;
    if (draft.id !== undefined) {
      if (value.trim()) changeOverlay(draft.id, { value, color });
      else deleteOverlay(draft.id);
    } else if (value.trim()) {
      addOverlay({ kind: 'text', value, color, size: TEXT_SIZE });
    }
  };

  const editOverlay = useCallback((overlay: Overlay) => {
    if (overlay.kind !== 'text') return;
    setTextDraft({
      id: overlay.id,
      value: overlay.value,
      color: overlay.color,
    });
    setMode('text');
  }, []);

  // ---- drawing ------------------------------------------------------------

  const addStroke = useCallback(
    (stroke: Omit<Stroke, 'id'>) => {
      const id = nextId.current++;
      updateEdit(e => ({ ...e, strokes: [...e.strokes, { ...stroke, id }] }));
    },
    [updateEdit]
  );

  // Undo removes whatever was added last (stroke or sticker)
  const undo = () =>
    updateEdit(e => {
      const lastStroke = e.strokes[e.strokes.length - 1]?.id ?? 0;
      const lastOverlay = e.overlays[e.overlays.length - 1]?.id ?? 0;
      if (!lastStroke && !lastOverlay) return e;
      return lastStroke > lastOverlay
        ? { ...e, strokes: e.strokes.slice(0, -1) }
        : { ...e, overlays: e.overlays.slice(0, -1) };
    });

  const canUndo = edit.strokes.length > 0 || edit.overlays.length > 0;

  // ---- crop -------------------------------------------------------------

  const startCrop = () => {
    setCropDraft({ rotation: edit.rotation, crop: edit.crop });
    setMode('crop');
  };

  const finishCrop = (apply: boolean) => {
    if (apply && cropDraft) {
      updateEdit(e => ({ ...e, ...cropDraft }));
    }
    setCropDraft(null);
    setMode('view');
  };

  // ---- closing & sending --------------------------------------------------

  const close = () => {
    const touched = edits.some(e => hasPixelEdits(e) || e.caption.trim());
    if (!touched) return onClose();
    Alert.alert('Discard edits?', 'Your changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onClose },
    ]);
  };

  const handleBack = () => {
    if (mode === 'crop') finishCrop(false);
    else if (mode === 'text') {
      setTextDraft(null);
      setMode('view');
    } else if (mode !== 'view') setMode('view');
    else close();
  };

  const waitForCanvas = async (uri: string) => {
    const started = Date.now();
    while (loadedUri.current !== uri && Date.now() - started < 3000) {
      await sleep(50);
    }
    await nextFrame();
    await nextFrame();
  };

  const send = async () => {
    if (!area) return;
    setMode('view');
    setExporting(true);
    try {
      const results: EditedImage[] = [];
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const e = editsRef.current[i];
        const caption = e.caption.trim();
        if (!hasPixelEdits(e)) {
          // Untouched photos go out at full quality
          results.push({ attachment: item, caption });
          continue;
        }
        setIndex(i);
        await waitForCanvas(item.uri);
        const uri = await captureRef(canvasRef, {
          format: 'jpg',
          quality: 0.9,
          result: 'tmpfile',
        });
        const size = await new Promise<Size>(resolve =>
          Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            () => resolve({ width: 0, height: 0 })
          )
        );
        results.push({
          caption,
          attachment: {
            kind: 'image',
            uri,
            name: item.name.replace(/\.\w+$/, '') + '-edited.jpg',
            mimeType: 'image/jpeg',
            width: size.width || undefined,
            height: size.height || undefined,
          },
        });
      }
      onSend(results, viewOnce);
    } catch (error) {
      setExporting(false);
      Alert.alert(
        'Could not prepare photo',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  // ---- render -------------------------------------------------------------

  const inCrop = mode === 'crop' && cropDraft;
  // Hidden chrome keeps its space so the canvas doesn't resize mid-drag
  const chromeHidden = drag.dragging;

  const renderTopBar = () => {
    if (mode === 'draw') {
      return (
        <View style={[themeStyles.flexRow, styles.topBar]}>
          <RoundButton label="Undo" onPress={undo}>
            <UndoSVG width={22} height={22} color="white" />
          </RoundButton>
          <View style={themeStyles.flex1} />
          <TouchableOpacity
            accessibilityLabel="Done drawing"
            style={styles.doneButton}
            onPress={() => setMode('view')}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (mode !== 'view') return <View style={styles.topBar} />;
    return (
      <View style={[themeStyles.flexRow, styles.topBar]}>
        <RoundButton label="Close" onPress={close}>
          <CloseSVG width={20} height={20} color="white" />
        </RoundButton>
        <View style={themeStyles.flex1} />
        {canUndo && (
          <RoundButton label="Undo" onPress={undo}>
            <UndoSVG width={22} height={22} color="white" />
          </RoundButton>
        )}
        <RoundButton label="Crop and rotate" onPress={startCrop}>
          <CropRotateSVG width={22} height={22} color="white" />
        </RoundButton>
        <RoundButton label="Stickers" onPress={() => setMode('emoji')}>
          <EmojiSVG width={22} height={22} color="white" />
        </RoundButton>
        <RoundButton
          label="Text"
          onPress={() => {
            setTextDraft({ value: '', color: EDITOR_COLORS[0] });
            setMode('text');
          }}>
          <Text style={styles.textTool}>Aa</Text>
        </RoundButton>
        <RoundButton label="Draw" onPress={() => setMode('draw')}>
          <PencilSVG width={20} height={20} color="white" />
        </RoundButton>
      </View>
    );
  };

  const renderCropBar = () => (
    <View
      style={[themeStyles.flexRow, themeStyles.flexNullCenter, styles.cropBar]}>
      <TouchableOpacity
        accessibilityLabel="Cancel crop"
        onPress={() => finishCrop(false)}>
        <Text style={styles.cropText}>Cancel</Text>
      </TouchableOpacity>
      <View
        style={[
          themeStyles.flex1,
          themeStyles.flexRow,
          themeStyles.flexCenter,
          styles.cropTools,
        ]}>
        <RoundButton
          label="Rotate"
          onPress={() =>
            setCropDraft(
              d =>
                d && {
                  rotation: nextRotation(d.rotation),
                  crop: rotateCropClockwise(d.crop),
                }
            )
          }>
          <RotateSVG width={20} height={20} fill="white" />
        </RoundButton>
        <TouchableOpacity
          accessibilityLabel="Reset crop"
          onPress={() => setCropDraft({ rotation: 0, crop: FULL_CROP })}>
          <Text style={styles.cropText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        accessibilityLabel="Apply crop"
        onPress={() => finishCrop(true)}>
        <Text style={[styles.cropText, styles.cropDone]}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCaptionBar = () => (
    <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}>
          {images.map((item, i) => (
            <TouchableOpacity
              key={item.uri + i}
              accessibilityLabel={`Photo ${i + 1}`}
              onPress={() => setIndex(i)}
              style={[styles.thumb, i === index && styles.thumbActive]}>
              <Image source={{ uri: item.uri }} style={styles.thumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View
        style={[
          themeStyles.flexRow,
          themeStyles.flexNullCenter,
          styles.captionPill,
        ]}>
        <TextInput
          value={edit.caption}
          onChangeText={caption => updateEdit(e => ({ ...e, caption }))}
          placeholder="Add a caption..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          selectionColor={primaryColor}
          multiline
          style={[themeStyles.flex1, styles.captionInput]}
        />
        <TouchableOpacity
          accessibilityLabel={viewOnce ? 'View once on' : 'View once off'}
          style={styles.viewOnce}
          onPress={() => setViewOnce(v => !v)}>
          <ViewOnceSVG
            width={26}
            height={26}
            filled={viewOnce}
            color={viewOnce ? primaryColor : 'white'}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          themeStyles.flexRow,
          themeStyles.flexNullCenter,
          styles.sendRow,
        ]}>
        <View style={styles.recipient}>
          <Text numberOfLines={1} style={styles.recipientText}>
            {recipientName}
          </Text>
        </View>
        <View style={themeStyles.flex1} />
        <TouchableOpacity
          accessibilityLabel="Send"
          style={[themeStyles.flexCenter, styles.send]}
          onPress={send}
          disabled={exporting}>
          <SendSVG
            width={24}
            height={24}
            color="white"
            style={styles.sendIcon}
          />
          {images.length > 1 && (
            <View style={[themeStyles.flexCenter, styles.sendCount]}>
              <Text style={styles.sendCountText}>{images.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={handleBack}
      supportedOrientations={['portrait']}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <KeyboardAvoidingView
        style={[themeStyles.flex1, styles.container]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ height: insets.top }} />
        <View
          style={chromeHidden && styles.hidden}
          pointerEvents={chromeHidden ? 'none' : 'auto'}>
          {renderTopBar()}
        </View>

        <View
          testID="media-editor-stage"
          style={[themeStyles.flex1, themeStyles.flexCenter]}
          onLayout={e =>
            setArea({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            })
          }>
          {area && edit && (
            <EditCanvas
              key={image.uri + index}
              ref={canvasRef}
              uri={image.uri}
              edit={edit}
              area={area}
              rotation={inCrop ? cropDraft.rotation : undefined}
              crop={inCrop ? FULL_CROP : undefined}
              drawing={mode === 'draw'}
              drawColor={drawColor}
              drawWidth={PEN_WIDTH}
              interactive={mode === 'view'}
              trashTop={windowHeight - TRASH_ZONE}
              onStroke={addStroke}
              onOverlayChange={changeOverlay}
              onOverlayDelete={deleteOverlay}
              onOverlayPress={editOverlay}
              onOverlayDragChange={(dragging, overTrash) =>
                setDrag({ dragging, overTrash })
              }
              onImageLoad={handleImageLoad}
              renderOverlay={layout =>
                inCrop ? (
                  <CropOverlay
                    width={layout.canvasWidth}
                    height={layout.canvasHeight}
                    crop={cropDraft.crop}
                    onChange={crop => setCropDraft(d => d && { ...d, crop })}
                  />
                ) : null
              }
            />
          )}

          {mode === 'draw' && (
            <View style={styles.palette}>
              <ColorSwatches
                value={drawColor}
                onChange={setDrawColor}
                vertical
              />
            </View>
          )}
        </View>

        {drag.dragging && (
          <View
            pointerEvents="none"
            style={[styles.trash, { bottom: insets.bottom + 40 }]}>
            <View
              style={[
                themeStyles.flexCenter,
                styles.trashCircle,
                drag.overTrash && styles.trashActive,
              ]}>
              <TrashSVG width={24} height={24} color="white" />
            </View>
          </View>
        )}

        <View
          style={chromeHidden && styles.hidden}
          pointerEvents={chromeHidden ? 'none' : 'auto'}>
          {inCrop ? renderCropBar() : mode === 'view' && renderCaptionBar()}
        </View>

        {mode === 'emoji' && (
          <View style={StyleSheet.absoluteFill}>
            <Pressable
              accessibilityLabel="Close stickers"
              style={themeStyles.flex1}
              onPress={() => setMode('view')}
            />
            <View style={[styles.emojiSheet, { height: windowHeight * 0.5 }]}>
              <EmojiPicker
                onEmojiSelect={emoji => {
                  addOverlay({
                    kind: 'emoji',
                    value: emoji,
                    color: 'black',
                    size: EMOJI_SIZE,
                  });
                  setMode('view');
                }}
              />
            </View>
          </View>
        )}

        {mode === 'text' && textDraft && (
          <TextOverlayEditor
            initialValue={textDraft.value}
            initialColor={textDraft.color}
            topInset={insets.top}
            onDone={finishText}
          />
        )}

        {exporting && (
          <View
            style={[
              StyleSheet.absoluteFill,
              themeStyles.flexCenter,
              styles.exporting,
            ]}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  topBar: {
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  roundButtonActive: {
    backgroundColor: primaryColor,
  },
  textTool: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: primaryColor,
  },
  doneText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  palette: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cropBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  cropTools: {
    gap: 24,
  },
  cropText: {
    color: 'white',
    fontSize: 16,
  },
  cropDone: {
    fontWeight: 'bold',
    color: primaryColor,
  },
  bottom: {
    paddingTop: 8,
    gap: 10,
  },
  thumbs: {
    paddingHorizontal: 10,
    gap: 6,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: primaryColor,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  captionPill: {
    marginHorizontal: 10,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  captionInput: {
    color: 'white',
    fontSize: 17,
    maxHeight: 100,
    paddingVertical: 12,
  },
  viewOnce: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendRow: {
    paddingHorizontal: 10,
  },
  recipient: {
    maxWidth: '60%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  recipientText: {
    color: 'white',
    fontSize: 14,
  },
  send: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: primaryColor,
  },
  sendIcon: {
    marginLeft: 3,
  },
  sendCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: 'white',
  },
  sendCountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'black',
  },
  trash: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  trashCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  trashActive: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.2 }],
  },
  emojiSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  exporting: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hidden: {
    opacity: 0,
  },
});
