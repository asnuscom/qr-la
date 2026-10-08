import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const WEEKDAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// Common wedding / event hours
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

// -------------------------------------------------------------
// 1. DATE PICKER MODAL (Interactive Calendar)
// -------------------------------------------------------------
interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onConfirm: (dateStr: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  // Parse initial date
  const parseInitial = () => {
    const parts = (value || '').split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m, day: d };
      }
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  };

  const initial = parseInitial();
  const [currentYear, setCurrentYear] = useState<number>(initial.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initial.month);
  const [selectedDay, setSelectedDay] = useState<number>(initial.day);

  useEffect(() => {
    if (visible) {
      const parsed = parseInitial();
      setCurrentYear(parsed.year);
      setCurrentMonth(parsed.month);
      setSelectedDay(parsed.day);
    }
  }, [visible, value]);

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // First day of month (Monday = 0, Sunday = 6)
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayMondayBased = (firstDayRaw + 6) % 7;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    const safeDay = Math.min(selectedDay, daysInMonth);
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(safeDay).padStart(2, '0');
    onConfirm(`${currentYear}-${mStr}-${dStr}`);
    onClose();
  };

  // Quick preset helpers
  const setQuickDate = (date: Date) => {
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
    setSelectedDay(date.getDate());
  };

  const handlePresetToday = () => setQuickDate(new Date());
  const handlePresetTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setQuickDate(d);
  };
  const handlePresetNextSaturday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    setQuickDate(d);
  };

  // Formatted preview
  const previewMonthStr = String(currentMonth + 1).padStart(2, '0');
  const previewDayStr = String(Math.min(selectedDay, daysInMonth)).padStart(2, '0');
  const previewDateStr = `${currentYear}-${previewMonthStr}-${previewDayStr}`;
  let formattedPreview = '';
  try {
    const dObj = new Date(`${previewDateStr}T12:00:00+03:00`);
    formattedPreview = dObj.toLocaleDateString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  } catch (_e) {}

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Etkinlik Tarihi Seçin</Text>
              <Text style={styles.modalSubtitle}>Türkiye Saati (GMT+3 🇹🇷)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#1A1817" />
            </TouchableOpacity>
            <View style={styles.monthTitleBox}>
              <Text style={styles.monthTitleText}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
            </View>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color="#1A1817" />
            </TouchableOpacity>
          </View>

          {/* Quick Year Picker Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScroll}
          >
            {[2025, 2026, 2027, 2028, 2029].map((yr) => (
              <TouchableOpacity
                key={yr}
                style={[styles.yearChip, currentYear === yr && styles.yearChipActive]}
                onPress={() => setCurrentYear(yr)}
                activeOpacity={0.8}
              >
                <Text style={[styles.yearChipText, currentYear === yr && styles.yearChipTextActive]}>
                  {yr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_NAMES.map((name, i) => (
              <Text
                key={name}
                style={[styles.weekdayText, (i === 5 || i === 6) && styles.weekendText]}
              >
                {name}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Empty slots for previous month */}
            {Array.from({ length: firstDayMondayBased }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.emptyDayCell} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.quickPresetsRow}>
            <TouchableOpacity style={styles.quickPresetBtn} onPress={handlePresetToday}>
              <Text style={styles.quickPresetBtnText}>Bugün</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPresetBtn} onPress={handlePresetTomorrow}>
              <Text style={styles.quickPresetBtnText}>Yarın</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPresetBtn} onPress={handlePresetNextSaturday}>
              <Text style={styles.quickPresetBtnText}>Gelecek Cmt</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Preview Box */}
          <View style={styles.selectedPreviewBox}>
            <Ionicons name="calendar-outline" size={16} color="#C5A059" />
            <Text style={styles.selectedPreviewText}>{formattedPreview}</Text>
          </View>

          {/* Confirm / Cancel Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Tarihi Onayla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 2. TIME PICKER MODAL (Interactive Clock & Minutes Grid)
// -------------------------------------------------------------
interface TimePickerModalProps {
  visible: boolean;
  value: string; // HH:mm
  onConfirm: (timeStr: string) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  const parseInitialTime = () => {
    const clean = (value || '19:00').trim().replace('.', ':');
    const parts = clean.split(':');
    if (parts.length >= 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return { hour: h, minute: m };
    }
    return { hour: '19', minute: '00' };
  };

  const initial = parseInitialTime();
  const [selectedHour, setSelectedHour] = useState<string>(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(initial.minute);

  useEffect(() => {
    if (visible) {
      const parsed = parseInitialTime();
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
    }
  }, [visible, value]);

  const handleConfirm = () => {
    onConfirm(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  const setPreset = (h: string, m: string) => {
    setSelectedHour(h);
    setSelectedMinute(m);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Etkinlik Saati Seçin</Text>
              <Text style={styles.modalSubtitle}>Türkiye Saati (TSİ GMT+3 🇹🇷)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Big Digital Display */}
          <View style={styles.digitalClockWrap}>
            <View style={styles.digitalBox}>
              <Text style={styles.digitalNumber}>{selectedHour}</Text>
              <Text style={styles.digitalLabel}>SAAT</Text>
            </View>
            <Text style={styles.digitalColon}>:</Text>
            <View style={styles.digitalBox}>
              <Text style={styles.digitalNumber}>{selectedMinute}</Text>
              <Text style={styles.digitalLabel}>DAKİKA</Text>
            </View>
          </View>

          {/* Quick Wedding Time Templates */}
          <Text style={styles.pickerSectionTitle}>Hızlı Etkinlik Şablonları:</Text>
          <View style={styles.presetChipsRow}>
            {[
              { h: '18', m: '00', label: '18:00 Kokteyl' },
              { h: '19', m: '00', label: '19:00 Nikah' },
              { h: '19', m: '30', label: '19:30 Yemek' },
              { h: '20', m: '00', label: '20:00 Giriş' },
              { h: '20', m: '30', label: '20:30 Müzik' },
              { h: '21', m: '00', label: '21:00 Pasta' },
            ].map((preset) => {
              const isMatch = selectedHour === preset.h && selectedMinute === preset.m;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.presetChip, isMatch && styles.presetChipActive]}
                  onPress={() => setPreset(preset.h, preset.m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, isMatch && styles.presetChipTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hour Selector Grid */}
          <Text style={styles.pickerSectionTitle}>Saat (00 - 23):</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeScroll}
          >
            {HOURS.map((hr) => {
              const isSelected = selectedHour === hr;
              return (
                <TouchableOpacity
                  key={hr}
                  style={[styles.timeSlotCell, isSelected && styles.timeSlotCellActive]}
                  onPress={() => setSelectedHour(hr)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                    {hr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Minute Selector */}
          <Text style={styles.pickerSectionTitle}>Dakika:</Text>
          <View style={styles.minuteRow}>
            {MINUTES.map((mn) => {
              const isSelected = selectedMinute === mn;
              return (
                <TouchableOpacity
                  key={mn}
                  style={[styles.minuteCell, isSelected && styles.minuteCellActive]}
                  onPress={() => setSelectedMinute(mn)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.minuteText, isSelected && styles.minuteTextActive]}>
                    :{mn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm / Cancel Actions */}
          <View style={[styles.actionRow, { marginTop: 24 }]}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Saati Onayla ({selectedHour}:{selectedMinute})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1817',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8A6D3B',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  monthTitleBox: {
    paddingHorizontal: 12,
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  yearScroll: {
    gap: 8,
    marginBottom: 14,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  yearChipTextActive: {
    color: '#FFF',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    marginBottom: 8,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  weekendText: {
    color: '#C5A059',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#C5A059',
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  dayCellTextSelected: {
    color: '#FFF',
    fontWeight: '800',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },
  quickPresetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    alignItems: 'center',
  },
  quickPresetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  selectedPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },
  selectedPreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  confirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#C5A059',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Time Picker specific styles
  digitalClockWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1817',
    borderRadius: 16,
    paddingVertical: 18,
    marginVertical: 14,
    gap: 12,
  },
  digitalBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  digitalNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  digitalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C5A059',
    marginTop: 2,
    letterSpacing: 1,
  },
  digitalColon: {
    fontSize: 34,
    fontWeight: '900',
    color: '#C5A059',
    marginBottom: 14,
  },
  pickerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 10,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  presetChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  timeScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  timeSlotCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotCellActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  timeSlotTextActive: {
    color: '#FFF',
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minuteCell: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minuteCellActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  minuteText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
  },
  minuteTextActive: {
    color: '#FFF',
  },
});
