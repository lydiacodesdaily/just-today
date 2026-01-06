/**
 * Default Guide Templates
 *
 * These are pre-defined guides for common context transitions.
 * Users can use them as-is or duplicate and customize them.
 */

import { Guide } from '../models/Guide';

export const DEFAULT_GUIDES: Guide[] = [
  {
    id: 'leaving-home',
    title: 'Leaving Home',
    items: [
      { id: 'lh-1', text: 'Keys', checked: false },
      { id: 'lh-2', text: 'Wallet / ID', checked: false },
      { id: 'lh-3', text: 'Phone', checked: false },
      { id: 'lh-4', text: 'Water bottle', checked: false },
      { id: 'lh-5', text: 'Meds (if daily)', checked: false },
      { id: 'lh-6', text: 'Sunglasses / weather gear', checked: false },
      { id: 'lh-7', text: 'Headphones', checked: false },
      { id: 'lh-8', text: 'Anything I set by the door last night', checked: false },
    ],
    isDefault: true,
  },
  {
    id: 'starting-work',
    title: 'Starting Work',
    items: [
      { id: 'sw-1', text: "Close tabs I don't need right now", checked: false },
      { id: 'sw-2', text: 'Phone on silent / out of reach', checked: false },
      { id: 'sw-3', text: 'Water nearby', checked: false },
      { id: 'sw-4', text: 'Bathroom break taken', checked: false },
      { id: 'sw-5', text: 'Desktop cleared', checked: false },
      { id: 'sw-6', text: 'One focus goal set', checked: false },
      { id: 'sw-7', text: 'Do Not Disturb on', checked: false },
    ],
    isDefault: true,
  },
  {
    id: 'ending-work',
    title: 'Ending Work Day',
    items: [
      { id: 'ew-1', text: 'Save open files', checked: false },
      { id: 'ew-2', text: "Write down tomorrow's top 3", checked: false },
      { id: 'ew-3', text: 'Close work apps', checked: false },
      { id: 'ew-4', text: 'Clear notifications', checked: false },
      { id: 'ew-5', text: 'Stretch or stand up', checked: false },
      { id: 'ew-6', text: 'Set phone boundary', checked: false },
    ],
    isDefault: true,
  },
  {
    id: 'packing',
    title: 'Packing Essentials',
    items: [
      { id: 'pk-1', text: 'Phone charger', checked: false },
      { id: 'pk-2', text: 'Meds + extras', checked: false },
      { id: 'pk-3', text: 'Toothbrush / toiletries', checked: false },
      { id: 'pk-4', text: 'Underwear + socks', checked: false },
      { id: 'pk-5', text: 'Comfy clothes', checked: false },
      { id: 'pk-6', text: 'Headphones', checked: false },
      { id: 'pk-7', text: 'ID / wallet', checked: false },
      { id: 'pk-8', text: 'Snacks', checked: false },
      { id: 'pk-9', text: 'Water bottle', checked: false },
      { id: 'pk-10', text: 'Backup battery', checked: false },
      { id: 'pk-11', text: 'Something to do (book, etc.)', checked: false },
    ],
    isDefault: true,
  },
  {
    id: 'bedtime',
    title: 'Bedtime Reset',
    items: [
      { id: 'bt-1', text: 'Meds taken', checked: false },
      { id: 'bt-2', text: 'Alarms set', checked: false },
      { id: 'bt-3', text: 'Phone charging (outside bedroom?)', checked: false },
      { id: 'bt-4', text: 'Doors locked', checked: false },
      { id: 'bt-5', text: 'Lights off', checked: false },
      { id: 'bt-6', text: 'Water by bed', checked: false },
      { id: 'bt-7', text: "Tomorrow's clothes laid out", checked: false },
    ],
    isDefault: true,
  },
];
