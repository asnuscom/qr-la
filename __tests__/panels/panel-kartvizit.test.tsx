import React from 'react';
import { render } from '@testing-library/react-native';
import VCardPanelScreen from '@/app/panel/kartvizit';

describe('VCardPanelScreen (/panel/kartvizit) Panel Test', () => {
  it('renders digital card and vCard management page', async () => {
    const screen = await render(<VCardPanelScreen />);
    expect(screen.getByText('Dijital Kartvizit & NFC')).toBeTruthy();
    expect(screen.getByText('💼 Dijital Kartvizit (vCard & NFC) Yönetimi')).toBeTruthy();
  });
});
