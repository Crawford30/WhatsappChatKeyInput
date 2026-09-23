import color from 'color';
import { primaryColor } from '../assets/style/Colors';

// Outgoing message bubble: a solid light tint of the theme colour
export const BUBBLE_PRIMARY_COLOR = color(primaryColor)
  .mix(color('white'), 0.82)
  .hex();

// Attachment menu icon colours (same palette as the uchat DocumentPicker)
export const ATTACHMENT_COLORS = {
  document: '#7F66FF',
  camera: '#FF2E74',
  gallery: '#007BFC',
  audio: '#FF7F2A',
};
