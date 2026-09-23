import {
  ArrowDown,
  BanSVG,
  ExitGroupIconSVG,
  EyeSVG,
  FORMDATA,
  MoreSVG,
  returnObject,
  styles,
  useAuth,
  useDelete,
  useForm,
  useGenericGet,
  useGenericSet,
} from '@dev-tech/uchat-shared-lib';
import DeleteSVG from '@dev-tech/uchat-shared-lib/src/assets/svg/DeleteSVG';
import {Loader} from '@dev-tech/uchat-shared-lib/src/components/common';
import {useStorage} from '@dev-tech/uchat-shared-lib/src/hooks/common/useStorage';
import {
  Attachment,
  ChatInput,
  Message as ChatInputMessage,
} from '@dev-tech/uchat-chat-input';
import {defaultPickers} from '@dev-tech/uchat-chat-input/src/pickers';
import Clipboard from '@react-native-clipboard/clipboard';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from 'react-native-reanimated';
import {useToast} from 'react-native-toast-notifications';
import {MgBgSVG} from '../../assests/svg/icons';
import {ArrowLeft} from '../../assests/svg/icons/ArrowLeft';
import {CopySVG} from '../../assests/svg/icons/CopySVG';
import {FlagSVG} from '../../assests/svg/icons/FlagSVG';
import {ForwardedSVG} from '../../assests/svg/icons/ForwardedSVG';
import {PencilSVG} from '../../assests/svg/icons/PencilSVG';
import {UserSVG} from '../../assests/svg/icons/UserSVG';
import GenericBottomSheet, {
  useBottomSheet,
} from '../../components/common/GenericBottomSheet';
import {useVoiceRecorder} from '../../components/common/VoiceRecorderContext';
import {ChatAvatar} from '../../components/messages/ChatAvatar';
import {EditMessageView} from '../../components/messages/EditMessageView';
import {
  QuickReactions,
  ReplyBubble,
  SaveContactCard,
} from '../../components/messages/MessageElements';
import MessageItem from '../../components/messages/MessageItem';
import {
  API_CHATS,
  API_DELETE_GROUP,
  API_LEAVE_GROUP,
  API_MESSAGES,
  getSocketUrl,
} from '../../constants/apis';
import {usePortalDialog} from '../../hooks/common/usePortalDialog';
import {useContacts} from '../../hooks/contacts/useContacts';
import {useEditMessage} from '../../hooks/messages/useEditMessage';
import {
  FORWARD,
  GROUP,
  ONLINE,
  ONLINE_STATUS,
  REPORT,
  SYSTEM,
} from '../../utils/constants';
import {openSaveContact} from '../../utils/contactUtils';
import {
  getLastSeen,
  HapticFeedback,
  isIOS,
  prepareAttachmentsPost,
  RenderActions,
} from '../../utils/helperUtils';
import GroupMentionMemberList from '../groups/GroupMentionMemberList';

const screenWidth = Dimensions.get('window').width;

/**
 * Converts a file picked in ChatInput into the `attachments` shape that
 * handleSendMessage / prepareAttachmentsPost expect. Mirrors the old
 * DocumentPicker (documents, audio) and ImageFilePicker (photos); MessageItem
 * relies on caption 'message_attachment' for images and 'audio' for audio.
 */
const toUchatAttachments = (attachment: Attachment) => ({
  author_first_name: 'test',
  author_last_name: 'test',
  author_phone_number: 'test',
  file: [
    {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.mimeType || 'application/octet-stream',
    },
  ],
  document_type: attachment.kind === 'document' ? 'letter' : 'other',
  caption:
    attachment.kind === 'image'
      ? 'message_attachment'
      : attachment.kind === 'audio'
      ? 'audio'
      : attachment.name,
});

export const MessagesScreen = ({navigation, route}: any) => {
  const {getContacts, contacts} = useContacts();
  const {PortalDialog, hideActions, showActions} = usePortalDialog();
  const [participants, setParticipants] = useState<any>([]);
  const {
    PortalDialog: LeaveGroupModal,
    showActions: showLeaveGroupModal,
    hideActions: hideLeaveGroupActions,
  } = usePortalDialog();
  const {
    PortalDialog: DeleteGroupModal,
    showActions: showDeleteGroupModal,
    hideActions: hideDeleteGroupActions,
  } = usePortalDialog();
  const {
    PortalDialog: DeleteMessageModal,
    showActions: showDeleteMessageModal,
    hideActions: hideDeleteMessageActions,
  } = usePortalDialog();
  const {uploadData: submitParticipant, error: posterror} = useGenericSet();
  const {uploadData: submitBlockUser} = useGenericSet();
  const {uploadData: submitDeleteGroupData, error: postDeleteGroupError} =
    useGenericSet();
  const {deleteData: deleteMessage} = useDelete();
  const toast = useToast();
  const {
    ref: refBottomSheet,
    open: openBottomSheet,
    close: closeBottomSheet,
  } = useBottomSheet();
  const {
    ref: refEditBS,
    open: openEditBS,
    close: closeEditBS,
  } = useBottomSheet();
  const flatListRef = useRef<any>(null);
  const textInputRef = useRef<TextInput>(null);
  const {user, authToken} = useAuth();
  const user_id = user?.user_id;
  const {
    chatTitle: title,
    recipient_id,
    chat_id,
    is_group_deleted,
    type,
    recipient_phone_number,
    recipient_username,
    contactName,
    isThirdParty,
    forwardMessage,
    profile_picture,
    is_blocked,
  } = route?.params || {};
  const [chatId, setChatId] = useState<string>(chat_id);
  const [messages, setMessages] = useState<any>([]);
  const [incomingMessage, setIncomingMessage] = useState();
  const [firstMessage, setFirstMessage] = useState(false);
  const [count, setCount] = useState(0);
  const [bottom, setBottom] = useState(true);
  const {form, onChange, setForm, updateFormValues} = useForm();
  const {uploadData} = useGenericSet();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(2);
  const [chatTitle, setChatTitle] = useState(title);
  const [selectedMessage, setSelectedMessage] = useState<any>();
  const [longPressMessage, setLongPressMessage] = useState<any>();
  const [sending, setSending] = useState<any>([]);
  const [forwardedMessage, setForwardedMessage] = useState(forwardMessage);
  const [highlightItem, setHighlightItem] = useState(null);
  const [online, setOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<any>();
  const {loadData, data} = useGenericGet();
  const [showMemberList, setShowMemberList] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [mentions, setMentions] = useState<{[key: string]: string}>({});
  const [cursorPosition, setCursorPosition] = useState(0);
  const {getData, storeData} = useStorage();

  // ChatInput shows the recording UI; this records the actual audio
  const {startRecording, stopRecording, cancelRecording} = useVoiceRecorder();
  const recorder = {
    start: startRecording,
    stop: async () => {
      const audio = await stopRecording();
      return (
        audio && {
          uri: audio.uri,
          duration: audio.duration,
          mimeType: audio.type,
          name: audio.name,
        }
      );
    },
    cancel: cancelRecording,
  };

  // Message Templates State
  const [showTemplates, setShowTemplates] = useState(false);
  const [recentTemplates, setRecentTemplates] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const draftMessage = form?.message || '';
      if (chatId) storeData(chatId, draftMessage);
    });
    return unsubscribe;
  }, [form, chatId]);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (templateText: string) => {
      // Set the template text in the form
      updateFormValues({message: templateText});

      // Hide the templates
      setShowTemplates(false);

      // Dismiss the keyboard
      Keyboard.dismiss();

      // Track recently used templates (optional)
      setRecentTemplates(prev => {
        const updated = [templateText, ...prev.filter(t => t !== templateText)];
        return updated.slice(0, 5); // Keep only last 5
      });

      // Haptic feedback
      HapticFeedback();
    },
    [updateFormValues],
  );

  // Load recent templates on mount
  useEffect(() => {
    const loadRecentTemplates = async () => {
      const saved = getData('recent_templates');
      if (saved) {
        try {
          setRecentTemplates(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recent templates:', error);
        }
      }
    };
    loadRecentTemplates();
  }, []);

  // Save recent templates when they change
  useEffect(() => {
    if (recentTemplates.length > 0) {
      storeData('recent_templates', JSON.stringify(recentTemplates));
    }
  }, [recentTemplates]);

  useEffect(() => {
    if (chat_id) {
      loadData({
        api: API_CHATS,
        id: chat_id,
        onSuccess: (data: any) => {
          setParticipants(data?.participants_details || []);
        },
      });
    }
  }, [chat_id]);

  const isGroup = type === GROUP;

  const [socket, setSocket] = useState<WebSocket>();

  const cleanNewData = (newData: any, prev: any) => {
    const lastMessage = prev[prev?.length - 1];
    const filtered = newData?.filter((obj: any) => obj?.id !== lastMessage?.id);
    return filtered;
  };

  const isGroupAdmin = data?.participants_details?.some(
    (participant: any) =>
      participant?.user?.id === user?.user_id && participant?.is_admin === true,
  );

  const updateUserMessage = (newData: any, prev: any) => {
    const newMessage = newData?.content;
    const index = prev?.findIndex(
      (message: any) => message?.content === newMessage && !message.id,
    );
    if (index !== -1) {
      prev[index] = newData;
    }
    return prev;
  };

  useEffect(getContacts, []);

  useEffect(() => {
    if (chatId) {
      const savedValue = getData(chatId);
      if (savedValue) {
        updateFormValues({message: savedValue});
      }
      const socketUrl = getSocketUrl(`chats/${chatId}/messages/`);
      const ws = new WebSocket(socketUrl, null, {
        headers: {authorization: `Bearer ${authToken}`},
      });
      setLoading(true);
      ws.onopen = () => {
        setLoading(false);
        setSocket(ws);
      };
      ws.onmessage = event => {
        const socketData = JSON.parse(event.data);
        const type = socketData?.type;
        const count = socketData?.count;
        const newData = socketData?.data;
        if (type === ONLINE_STATUS) {
          setLastSeen(socketData.last_seen);
          setOnline(socketData.is_online);
        }
        if (type === 'list' && newData?.length > 0) {
          setCount(count);
          if (newData?.length === 1 && firstMessage) {
            setIncomingMessage(newData?.[0]?.content);
            return;
          }
          setMessages((prev: any) => [...prev, ...cleanNewData(newData, prev)]);
        } else if (type === 'single') {
          if (newData.type === SYSTEM) {
            return setMessages((prev: any) => [newData, ...prev]);
          }
          setIncomingMessage(newData?.content);
          if (newData?.created_by?.id === user_id) {
            return setMessages((prev: any) => [
              ...updateUserMessage(newData, prev),
            ]);
          }
          setMessages((prev: any) => [newData, ...prev]);
        }
      };
      ws.onerror = error => {
        setLoading(false);
        console.error('WebSocket error: ', error);
      };
      ws.onclose = event => {
        console.log('WebSocket connection closed: ', event.reason);
      };
    } else {
      setLoading(false);
    }
  }, [chatId, firstMessage]);

  useEffect(() => {
    if (sending?.includes(incomingMessage)) {
      setSending([]);
    }
  }, [incomingMessage]);

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);

  useEffect(() => {
    if (forwardedMessage && !loading && flatListRef !== null) {
      handleSendMessage({message: forwardMessage});
      setForwardedMessage(null);
    }
  }, [loading, flatListRef, forwardedMessage]);

  const scrollToBottom = () => {
    if (flatListRef !== null)
      flatListRef?.current?.scrollToOffset({animated: true});
  };

  const scrollToMessage = (id: any) => {
    const index = messages.findIndex((message: any) => message.id === id);
    if (flatListRef !== null)
      flatListRef.current.scrollToIndex({
        animated: true,
        index: index,
        offset: -50,
      });
    setHighlightItem(index);
  };

  const getRecipient = () => {
    const recepient = chatId ? {chat: chatId} : {recipient: recipient_id};
    return recepient;
  };

  const clearSelectedMessage = () => setSelectedMessage(null);

  const handleSendMessage = useCallback(
    ({attachments, message}: any) => {
      const rawContent = (message || form?.message)?.trim();
      const content = processMentionsForSending(rawContent);

      const payload = {
        content,
        ...getRecipient(),
        ...prepareAttachmentsPost([attachments], 'attachments'),
        ...returnObject(isGroup, {chat: chatId}),
        ...returnObject(selectedMessage?.id, {
          replied_message: selectedMessage?.id,
        }),
        ...returnObject(forwardedMessage, {forwarded: true}),
      };

      if (content || attachments) {
        setSending([...sending, content]);
        clearSelectedMessage();

        setForm({message: ''});
        setMentions({});

        uploadData({
          api: API_MESSAGES,
          params: payload,
          type: attachments && FORMDATA,
          onSuccess: (data: any) => {
            if (!chatId && data?.chat) {
              if (!firstMessage) setFirstMessage(true);
              setChatId(data?.chat);
            }
          },
        });

        const viewAttachments = attachments?.file?.map((file: any) => ({
          file: file?.uri,
          caption: attachments?.caption,
          ...returnObject(attachments?.document_type === 'letter', {
            caption: file?.name,
            extention: file?.name,
          }),
          isViewable: true,
        }));

        setMessages((prev: any) => [
          {
            created_by: {id: user_id},
            content,
            created_at: new Date(),
            attachments: viewAttachments,
          },
          ...prev,
        ]);

        scrollToBottom();
      }
    },
    [form, selectedMessage, forwardedMessage, chatId, sending, isGroup],
  );

  // Everything ChatInput sends goes through the existing handleSendMessage
  const handleChatInputSend = (sent: ChatInputMessage) => {
    switch (sent.type) {
      case 'text':
        handleSendMessage({message: sent.text});
        break;
      case 'attachment':
        if (!sent.attachment) return;
        // TODO: send `sent.viewOnce` once the API supports view-once media.
        handleSendMessage({
          // ' ' stops handleSendMessage from falling back to the typed draft
          message: sent.text || ' ',
          attachments: toUchatAttachments(sent.attachment),
        });
        break;
      case 'sticker':
        // Built-in stickers are emoji; send them as the message text
        if (sent.sticker?.emoji) handleSendMessage({message: sent.sticker.emoji});
        break;
      case 'voice':
        if (sent.attachment) {
          handleSendAudioMessage({
            uri: sent.attachment.uri,
            type: sent.attachment.mimeType || 'audio/m4a',
            name: sent.attachment.name,
            duration: sent.duration ?? 0,
          });
        }
        break;
    }
  };

  interface AudioData {
    uri: string;
    type: string;
    name: string;
    duration: number;
  }

  const handleSendAudioMessage = useCallback(
    (audioData?: AudioData) => {
      if (!audioData) {
        return;
      }

      const attachments = {
        file: [
          {
            uri: audioData.uri,
            type: audioData.type,
            name: audioData.name,
            duration: audioData.duration,
          },
        ],
        document_type: 'other',
        caption: 'audio',
      };

      const payload = {
        ...getRecipient(),
        ...prepareAttachmentsPost([attachments], 'attachments'),
        ...returnObject(isGroup, {chat: chatId}),
        ...returnObject(selectedMessage?.id, {
          replied_message: selectedMessage?.id,
        }),
        ...returnObject(forwardedMessage, {forwarded: true}),
      };

      if (sending.includes('')) return;

      setSending([...sending, '']);
      clearSelectedMessage();
      setMentions({});

      uploadData({
        api: API_MESSAGES,
        params: payload,
        type: FORMDATA,
        onSuccess: (data: any) => {
          if (!chatId && data?.chat) {
            if (!firstMessage) setFirstMessage(true);
            setChatId(data?.chat);
          }
          setSending((prev: any) => prev.filter((item: any) => item !== ''));
        },
        onError: (error: any) => {
          console.error('Upload Error:', error);
          setSending((prev: any) => prev.filter((item: any) => item !== ''));
        },
      });

      setMessages((prev: any) => [
        {
          created_by: {id: user_id},
          created_at: new Date(),
          attachments: [
            {
              file: audioData.uri,
              caption: 'audio',
              type: audioData.type,
              duration: audioData.duration,
              isViewable: true,
            },
          ],
        },
        ...prev,
      ]);

      scrollToBottom();
    },
    [selectedMessage, forwardedMessage, chatId, sending, isGroup],
  );

  const openDetails = () =>
    navigation.navigate('ChatDetails', {
      title: chatTitle,
      chat_id,
      recipient_phone_number,
      recipient_username,
      contactName,
      lastSeen,
      profile_picture,
      isThirdParty,
      is_group_deleted,
    });

  const getChatStatus = () => {
    let status = 'Tap here for more info';
    if (isGroup || isThirdParty) return status;
    if (online) return ONLINE;
    return lastSeen && getLastSeen(lastSeen);
  };

  const chatStatus = getChatStatus();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', height: 40}}>
          <IconButton
            icon={ArrowLeft}
            style={{
              margin: 0,
              marginLeft: 0,
              paddingBottom: Platform.OS === 'ios' ? 12 : 0,
            }}
            onPress={() => navigation.goBack()}
          />
          <TouchableOpacity
            onPress={openDetails}
            style={[
              {
                marginLeft: isIOS ? 0 : 8,
                paddingBottom: isIOS ? 12 : 0,
              },
              styles.flexRow,
              styles.flexNullCenter,
            ]}>
            <ChatAvatar
              {...{
                isThirdParty,
                isGroup,
                profile_picture,
                title,
                size: 36,
              }}
            />
            <View style={{marginLeft: isIOS ? 15 : 8}}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#000',
                  maxWidth: screenWidth * 0.5,
                }}>
                {chatTitle}
              </Text>
              {!!chatStatus && (
                <Animated.Text
                  entering={FadeInUp}
                  exiting={FadeOutDown}
                  style={[{fontSize: 12}, styles.greyColor]}>
                  {chatStatus}
                </Animated.Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <IconButton
          size={15}
          style={{
            margin: 0,
            marginEnd: -4,
            paddingBottom: Platform.OS === 'ios' ? 12 : 0,
          }}
          icon={MoreSVG}
          onPress={showActions}
        />
      ),
      headerStyle: {
        height: Platform.OS === 'ios' ? 80 : 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitle: '',
      headerLeftContainerStyle: {
        paddingLeft: 12,
      },
      headerRightContainerStyle: {
        paddingRight: 8,
      },
    });
  }, [chatTitle, chatStatus]);

  function loadMoreData() {
    if (messages?.length < count) {
      socket?.send(
        JSON.stringify({
          page,
        }),
      );
      setPage(prev => prev + 1);
    }
  }

  const handleLongPress = (data: any) => {
    HapticFeedback();
    setLongPressMessage(data);
    openBottomSheet();
  };

  const _renderItem = ({item, index}: any) => {
    return (
      <MessageItem
        data={item}
        sent={!sending?.includes(item?.content)}
        index={index}
        user_id={user_id}
        type={type}
        prevMessage={messages?.[index + 1]}
        contacts={contacts}
        onSwipe={setSelectedMessage}
        onLongPress={() => handleLongPress(item)}
        scrollTo={scrollToMessage}
        highlight={highlightItem === index}
        setHighlightItem={setHighlightItem}
      />
    );
  };

  const deleteMessageData = () => {
    const messageID = longPressMessage?.id;
    if (!messageID) {
      console.warn('Message ID is required.');
      toast.show('Message ID is required.', {
        type: 'warning',
        placement: 'top',
        duration: 3000,
      });
      return;
    }
    deleteMessage({
      id: messageID,
      api: API_MESSAGES,
      onSuccess: () => {
        const updatedMessages = messages.map((message: any) => {
          if (message.id === messageID) {
            return {...message, deleted: true};
          }
          return message;
        });
        setMessages(updatedMessages);
      },
    });
    hideDeleteMessageActions();
  };

  const saveContact = () =>
    openSaveContact({
      username: recipient_username,
      phone_number: `+${recipient_phone_number}`,
      callback: (data: any) => {
        setTimeout(() => {
          setChatTitle(data?.name);
        }, 2000);
      },
    });

  const handleBlock = () => {
    submitBlockUser({
      api: `${API_CHATS}${chatId}/${is_blocked ? 'unblock' : 'block'}/`,
      onSuccess: (data: any) => {
        if (!is_blocked) navigation.goBack();
        toast.show(data?.detail);
      },
    });
  };

  const openReport = () => {
    navigation.navigate(REPORT, {
      callback: (message: string) => {
        toast.show(message);
      },
    });
  };

  const leaveGroup = () => {
    const api = `${API_CHATS}${chat_id}/${API_LEAVE_GROUP}`;
    submitParticipant({
      api,
      onSuccess: (responseData: any) => {
        if (responseData?.message) {
          toast.show(responseData.message, {
            type: 'success',
            placement: 'top',
            duration: 3000,
          });
        }
        navigation.goBack();
      },
    });
    if (posterror?.error) {
      toast.show(posterror.error, {
        type: 'danger',
        placement: 'top',
        duration: 3000,
      });
      hideLeaveGroupActions();
    }
  };

  const deleteGroup = () => {
    const api = `${API_CHATS}${chatId}/${API_DELETE_GROUP}`;
    submitDeleteGroupData({
      api,
      onSuccess: (responseData: any) => {
        if (responseData?.message) {
          toast.show(responseData.message, {
            type: 'success',
            placement: 'top',
            duration: 3000,
          });
        }
        navigation.goBack();
      },
    });
    if (postDeleteGroupError?.error) {
      toast.show(postDeleteGroupError.error, {
        type: 'danger',
        placement: 'top',
        duration: 3000,
      });
      hideDeleteGroupActions();
    }
  };

  const actions = [
    {
      label: 'Add to Contacts',
      visible: contactName === null && !isGroup,
      onPress: saveContact,
      icon: UserSVG,
    },
    {
      onPress: openDetails,
      label: isGroup ? 'Group Info' : 'View Contact',
      icon: EyeSVG,
    },
    {
      onPress: showLeaveGroupModal,
      label: <Text style={[styles.redColor]}>Exit Group</Text>,
      icon: ExitGroupIconSVG,
      visible: isGroup && !is_group_deleted,
    },
    {
      onPress: showDeleteGroupModal,
      label: <Text style={[styles.redColor]}>Delete Group</Text>,
      icon: DeleteSVG,
      visible: isGroup && !is_group_deleted && isGroupAdmin,
    },
    {
      label: is_blocked ? 'Unblock' : 'Block',
      description: is_blocked
        ? 'Tap to unblock'
        : "You won't be able to contact each other",
      onPress: handleBlock,
      icon: BanSVG,
      visible: !isGroup,
    },
    {
      label: 'Report',
      description: "This user won't know you reported",
      onPress: openReport,
      icon: FlagSVG,
      visible: !isGroup,
    },
  ];

  const messageActions = [
    {
      label: 'Edit',
      icon: PencilSVG,
      visible:
        user_id === longPressMessage?.created_by?.id &&
        !longPressMessage?.forwarded,
      onPress: () => {
        openEditBS();
      },
    },
    {
      label: FORWARD,
      icon: ForwardedSVG,
      onPress: () => {
        const params = {forwardMessage: longPressMessage?.content};
        navigation.navigate('ForwardScreen', params);
      },
    },
    {
      label: 'Copy',
      icon: CopySVG,
      onPress: () => {
        Clipboard.setString(longPressMessage?.content);
      },
    },
    {
      label: <Text style={{color: 'red'}}>Delete</Text>,
      visible: user_id === longPressMessage?.created_by?.id,
      icon: DeleteSVG,
      onPress: showDeleteMessageModal,
    },
  ];

  const handleMemberSelect = (username: string, phoneNumber: string) => {
    const message = form?.message || '';
    const currentPosition = cursorPosition;

    const lastAtIndex = message.lastIndexOf('@', currentPosition - 1);

    if (lastAtIndex >= 0) {
      const before = message.slice(0, lastAtIndex);
      const after = message.slice(currentPosition);

      const newMessage = `${before}@${username} ${after}`;

      setMentions(prev => ({
        ...prev,
        [username]: phoneNumber,
      }));

      updateFormValues({message: newMessage});

      setShowMemberList(false);
      setTagQuery('');

      const newCursorPosition = lastAtIndex + username.length + 2;

      setTimeout(() => {
        textInputRef.current?.focus();
        textInputRef.current?.setNativeProps({
          selection: {
            start: newCursorPosition,
            end: newCursorPosition,
          },
        });
        setCursorPosition(newCursorPosition);
      }, 100);

      HapticFeedback();
    }
  };

  const processMentionsForSending = (message: string): string => {
    let processedMessage = message;

    Object.keys(mentions).forEach(username => {
      const phoneNumber = mentions[username];
      const mentionRegex = new RegExp(`@${username}\\b`, 'g');
      processedMessage = processedMessage.replace(
        mentionRegex,
        `@${phoneNumber}`,
      );
    });

    return processedMessage;
  };

  const cleanupMentions = (newMessage: string) => {
    const currentMentions = {...mentions};
    const mentionedUsernames = Object.keys(currentMentions);

    mentionedUsernames.forEach(username => {
      if (!newMessage.includes(`@${username}`)) {
        delete currentMentions[username];
      }
    });

    setMentions(currentMentions);
  };

  // Optimized text change handler
  const handleTextChange = useCallback(
    (value: string) => {
      onChange({name: 'message', value});

      // Hide templates when user starts typing
      if (value && value.trim() !== '' && showTemplates) {
        setShowTemplates(false);
      }

      cleanupMentions(value);

      const currentPosition = cursorPosition || value.length;
      const lastAtIndex = value.lastIndexOf('@', currentPosition - 1);

      if (isGroup && lastAtIndex >= 0) {
        const textAfterAt = value.slice(lastAtIndex + 1, currentPosition);
        const hasSpaceAfterAt = textAfterAt.includes(' ');

        if (!hasSpaceAfterAt) {
          const query = textAfterAt.trim();
          setTagQuery(query);
          if (!showMemberList) {
            setShowMemberList(true);
          }
        } else {
          setShowMemberList(false);
          setTagQuery('');
        }
      } else {
        setShowMemberList(false);
        setTagQuery('');
      }
    },
    [onChange, cursorPosition, isGroup, showMemberList, showTemplates],
  );

  const handleSelectionChange = useCallback(
    ({nativeEvent: {selection}}: any) => {
      setCursorPosition(selection.end);
      const value = form?.message || '';
      const currentPosition = selection.end;

      const lastAtIndex = value.lastIndexOf('@', currentPosition - 1);

      if (isGroup && lastAtIndex >= 0) {
        const textAfterAt = value.slice(lastAtIndex + 1, currentPosition);
        const hasSpaceAfterAt = textAfterAt.includes(' ');

        if (!hasSpaceAfterAt) {
          const query = textAfterAt.trim();
          setTagQuery(query);
          if (!showMemberList) {
            setShowMemberList(true);
          }
        } else {
          setShowMemberList(false);
          setTagQuery('');
        }
      } else {
        setShowMemberList(false);
        setTagQuery('');
      }
    },
    [form?.message, isGroup, showMemberList],
  );

  return (
    <>
      <DeleteMessageModal
        title="Delete Message"
        onAccept={() => deleteMessageData()}
        acceptText="Delete"
        onDismiss={hideDeleteMessageActions}>
        <Text style={{paddingHorizontal: 15}}>Do you wish to proceed?</Text>
        <View
          style={{
            marginTop: 15,
            marginBottom: 15,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
          }}></View>
      </DeleteMessageModal>
      <LeaveGroupModal
        title="Leave Group"
        onAccept={() => {
          leaveGroup();
        }}
        onDismiss={() => {
          hideLeaveGroupActions();
        }}>
        <Text style={{paddingHorizontal: 15}}>Do you wish to proceed?</Text>
      </LeaveGroupModal>
      <DeleteGroupModal
        title="Delete Group"
        onAccept={() => {
          deleteGroup();
        }}
        onDismiss={() => {
          hideDeleteGroupActions();
        }}>
        <Text style={{paddingHorizontal: 15}}>Do you wish to proceed?</Text>
      </DeleteGroupModal>
      <PortalDialog title="Actions">
        {RenderActions({actions, onPress: hideActions})}
      </PortalDialog>
      <View style={[styles.flex1]}>
        <View style={[styles.absolute, {top: 0, left: 0, right: 0, bottom: 0}]}>
          <MgBgSVG fill="#ddd" width={'100%'} height={400} />
          <MgBgSVG fill="#ddd" width={'100%'} height={400} />
        </View>
        <SaveContactCard
          visible={
            chatTitle?.startsWith('+') &&
            contactName === null &&
            recipient_phone_number
          }
          phone={title}
          username={recipient_username}
          onPress={saveContact}
        />
        <View style={[styles.flex1]}>
          {!loading ? (
            <>
              <FlatList
                inverted
                onScroll={event => {
                  let y = event.nativeEvent.contentOffset.y;
                  setBottom(y <= 0);
                }}
                onEndReached={loadMoreData}
                initialNumToRender={4}
                data={messages}
                renderItem={_renderItem}
                keyExtractor={(item: any, index: any) => {
                  return `temp-msg-${index}-${item?.created_at || Date.now()}-${
                    item?.created_at
                  }`;
                }}
                ItemSeparatorComponent={() => <View style={{padding: 1}} />}
                ref={flatListRef}
              />
              {!bottom && (
                <Animated.View
                  entering={FadeInDown.duration(200)}
                  exiting={FadeOutUp.duration(200)}>
                  <View
                    style={{
                      position: 'absolute',
                      borderRadius: 50,
                      margin: 16,
                      right: 0,
                      bottom: 0,
                      elevation: 10,
                    }}>
                    <IconButton
                      style={{
                        width: 35,
                        height: 35,
                        margin: 0,
                      }}
                      containerColor="white"
                      icon={ArrowDown}
                      onPress={scrollToBottom}
                    />
                  </View>
                </Animated.View>
              )}
            </>
          ) : (
            <View style={[styles.centerScreen]}>
              <Loader />
            </View>
          )}
        </View>

        <GroupMentionMemberList
          visible={showMemberList && isGroup}
          participants={participants}
          tagQuery={tagQuery}
          currentMessage={form?.message || ''}
          onSelect={handleMemberSelect}
          onClose={() => {
            setShowMemberList(false);
            setTagQuery('');
          }}
        />

        {!(is_group_deleted && isGroup) && !isThirdParty ? (
          <ChatInput
            recipientName={chatTitle}
            value={form?.message || ''}
            onChangeText={handleTextChange}
            inputRef={textInputRef}
            onSelectionChange={handleSelectionChange}
            onFocus={() => {
              // Show templates only if message is empty and not showing member list
              if (
                (!form?.message || form?.message.trim() === '') &&
                !showMemberList
              ) {
                setShowTemplates(true);
              }
            }}
            onSendMessage={handleChatInputSend}
            pickers={defaultPickers}
            header={
              <ReplyBubble
                visible={selectedMessage}
                data={selectedMessage}
                onClose={clearSelectedMessage}
                style={{marginHorizontal: 10, marginTop: 10}}
              />
            }
            recorder={recorder}
          />
        ) : (
          <View style={[styles.whiteBg, styles.p15]}>
            <Text style={[styles.textCenter, styles.greyColor, styles.font13]}>
              You can not reply to this chat.
            </Text>
          </View>
        )}
      </View>
      <GenericBottomSheet updateRef={refBottomSheet} height={190}>
        <QuickReactions callback={closeBottomSheet} />
        {RenderActions({actions: messageActions, onPress: closeBottomSheet})}
      </GenericBottomSheet>
      <GenericBottomSheet updateRef={refEditBS} height={130}>
        <EditMessageView
          onSubmit={closeEditBS}
          hook={() =>
            useEditMessage({data: longPressMessage, messages, setMessages})
          }
        />
      </GenericBottomSheet>
    </>
  );
};
