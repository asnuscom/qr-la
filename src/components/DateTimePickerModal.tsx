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

// Common wedding / event hours & 5-minute intervals
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const ALL_MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const QUICK_TIME_PRESETS = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
const PRIME_HOURS = ['17', '18', '19', '20', '21', '22', '23'];

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
// 2. TIME PICKER MODAL (Modern Interactive Stepper & Grid Selector)
// -------------------------------------------------------------
interface TimePickerModalProps {
  visible: boolean;
  value: string; // HH:mm
  onConfirm: (timeStr: string) => void;
  onClose: () => void;
}

const parseTimeToParts = (val?: string): { hour: string; minute: string } => {
  const clean = (val || '19:00').trim().replace('.', ':');
  const parts = clean.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h) || h < 0 || h > 23) h = 19;
    if (isNaN(m) || m < 0 || m > 59) m = 0;
    return {
      hour: String(h).padStart(2, '0'),
      minute: String(m).padStart(2, '0'),
    };
  }
  return { hour: '19', minute: '00' };
};

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState<string>('19');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [activeTab, setActiveTab] = useState<'hour' | 'minute'>('hour');

  useEffect(() => {
    if (visible) {
      const parsed = parseTimeToParts(value);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setActiveTab('hour');
    }
  }, [visible, value]);

  const handleStepHour = (delta: number) => {
    const cur = parseInt(selectedHour, 10);
    const next = (cur + delta + 24) % 24;
    setSelectedHour(String(next).padStart(2, '0'));
  };

  const handleStepMinute = (delta: number) => {
    const cur = parseInt(selectedMinute, 10);
    let next = cur + delta;
    if (next >= 60) next = 0;
    else if (next < 0) next = 55;
    // Round to nearest 5
    next = Math.round(next / 5) * 5;
    if (next >= 60) next = 0;
    setSelectedMinute(String(next).padStart(2, '0'));
  };

  const handleSelectPreset = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      setSelectedHour(parts[0]);
      setSelectedMinute(parts[1]);
    }
  };

  const handleSelectHour = (hr: string) => {
    setSelectedHour(hr);
    // Smooth transition to minute selection
    setActiveTab('minute');
  };

  const handleSelectMinute = (mn: string) => {
    setSelectedMinute(mn);
  };

  const handleConfirm = () => {
    onConfirm(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  const getPeriodLabel = (hStr: string) => {
    const h = parseInt(hStr, 10);
    if (h >= 5 && h < 12) return 'Sabah';
    if (h >= 12 && h < 17) return 'Öğleden Sonra';
    if (h >= 17 && h < 22) return 'Akşam';
    return 'Gece';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.timeModalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Etkinlik Saati</Text>
              <View style={styles.tzBadgeRow}>
                <Ionicons name="time" size={13} color="#8A6D3B" />
                <Text style={styles.modalSubtitle}>TSİ GMT+3 • {getPeriodLabel(selectedHour)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Hero Digital Stepper Box */}
          <View style={styles.heroClockCard}>
            {/* Hour Stepper Box */}
            <View style={styles.stepperColumn}>
              <TouchableOpacity
                style={styles.stepArrowBtn}
                onPress={() => handleStepHour(1)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-up" size={18} color="#8A6D3B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.digitalBoxTouch,
                  activeTab === 'hour' && styles.digitalBoxTouchActive,
                ]}
                onPress={() => setActiveTab('hour')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.heroDigitalNum,
                  activeTab === 'hour' && styles.heroDigitalNumActive,
                ]}>
                  {selectedHour}
                </Text>
                <Text style={[
                  styles.heroDigitalLabel,
                  activeTab === 'hour' && styles.heroDigitalLabelActive,
                ]}>
                  SAAT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepArrowBtn}
                onPress={() => handleStepHour(-1)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-down" size={18} color="#8A6D3B" />
              </TouchableOpacity>
            </View>

            {/* Colon */}
            <View style={styles.colonContainer}>
              <Text style={styles.heroColon}>:</Text>
            </View>

            {/* Minute Stepper Box */}
            <View style={styles.stepperColumn}>
              <TouchableOpacity
                style={styles.stepArrowBtn}
                onPress={() => handleStepMinute(5)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-up" size={18} color="#8A6D3B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.digitalBoxTouch,
                  activeTab === 'minute' && styles.digitalBoxTouchActive,
                ]}
                onPress={() => setActiveTab('minute')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.heroDigitalNum,
                  activeTab === 'minute' && styles.heroDigitalNumActive,
                ]}>
                  {selectedMinute}
                </Text>
                <Text style={[
                  styles.heroDigitalLabel,
                  activeTab === 'minute' && styles.heroDigitalLabelActive,
                ]}>
                  DAKİKA
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepArrowBtn}
                onPress={() => handleStepMinute(-5)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-down" size={18} color="#8A6D3B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick 1-Tap Presets */}
          <View style={styles.quickPresetsHeaderRow}>
            <Text style={styles.quickPresetsLabel}>Sık Kullanılan:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPresetsChipsScroll}
            >
              {QUICK_TIME_PRESETS.map((preset) => {
                const isSelected = `${selectedHour}:${selectedMinute}` === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.quickPresetChip, isSelected && styles.quickPresetChipActive]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.quickPresetChipText, isSelected && styles.quickPresetChipTextActive]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Segmented Selector Tabs */}
          <View style={styles.segmentedTabBar}>
            <TouchableOpacity
              style={[styles.segmentedTab, activeTab === 'hour' && styles.segmentedTabActive]}
              onPress={() => setActiveTab('hour')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="time"
                size={15}
                color={activeTab === 'hour' ? '#FFF' : '#8A6D3B'}
              />
              <Text style={[styles.segmentedTabText, activeTab === 'hour' && styles.segmentedTabTextActive]}>
                Saat Seç ({selectedHour})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentedTab, activeTab === 'minute' && styles.segmentedTabActive]}
              onPress={() => setActiveTab('minute')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="stopwatch-outline"
                size={15}
                color={activeTab === 'minute' ? '#FFF' : '#8A6D3B'}
              />
              <Text style={[styles.segmentedTabText, activeTab === 'minute' && styles.segmentedTabTextActive]}>
                Dakika Seç (:{selectedMinute})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selection Content Container */}
          <View style={styles.selectionBody}>
            {activeTab === 'hour' ? (
              <View style={styles.hourGridContainer}>
                <View style={styles.gridHintRow}>
                  <Text style={styles.gridHintText}>Başlangıç saatine dokunun:</Text>
                  <View style={styles.primeHintBadge}>
                    <Text style={styles.primeHintBadgeText}>⭐ Akşam Saatleri</Text>
                  </View>
                </View>

                {/* 6 columns x 4 rows = 24 hours */}
                <View style={styles.hoursGrid}>
                  {ALL_HOURS.map((hr) => {
                    const isSelected = selectedHour === hr;
                    const isPrime = PRIME_HOURS.includes(hr);
                    return (
                      <TouchableOpacity
                        key={hr}
                        style={[
                          styles.hourBadge,
                          isPrime && styles.hourBadgePrime,
                          isSelected && styles.hourBadgeSelected,
                        ]}
                        onPress={() => handleSelectHour(hr)}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.hourBadgeText,
                          isPrime && !isSelected && styles.hourBadgeTextPrime,
                          isSelected && styles.hourBadgeTextSelected,
                        ]}>
                          {hr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.minuteGridContainer}>
                <View style={styles.gridHintRow}>
                  <Text style={styles.gridHintText}>5'er dakikalık aralıkla seçin:</Text>
                  <View style={styles.minuteStepBtnsRow}>
                    <TouchableOpacity
                      style={styles.minuteStepBtn}
                      onPress={() => handleStepMinute(-15)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.minuteStepBtnText}>-15 dk</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.minuteStepBtn}
                      onPress={() => handleStepMinute(15)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.minuteStepBtnText}>+15 dk</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 columns x 3 rows = 12 minute increments */}
                <View style={styles.minutesGrid}>
                  {ALL_MINUTES.map((mn) => {
                    const isSelected = selectedMinute === mn;
                    return (
                      <TouchableOpacity
                        key={mn}
                        style={[
                          styles.minuteBadge,
                          isSelected && styles.minuteBadgeSelected,
                        ]}
                        onPress={() => handleSelectMinute(mn)}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.minuteBadgeText,
                          isSelected && styles.minuteBadgeTextSelected,
                        ]}>
                          :{mn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>
                Saati Onayla ({selectedHour}:{selectedMinute})
              </Text>
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

  // Time Picker Modern Redesign Styles
  timeModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  tzBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  heroClockCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    gap: 8,
  },
  stepperColumn: {
    alignItems: 'center',
    gap: 6,
  },
  stepArrowBtn: {
    width: 36,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  digitalBoxTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EFE7DA',
  },
  digitalBoxTouchActive: {
    backgroundColor: '#FFFDF9',
    borderColor: '#C5A059',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  heroDigitalNum: {
    fontSize: 40,
    fontWeight: '900',
    color: '#374151',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  heroDigitalNumActive: {
    color: '#8A6D3B',
  },
  heroDigitalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    marginTop: 2,
    letterSpacing: 1.5,
  },
  heroDigitalLabelActive: {
    color: '#C5A059',
  },
  colonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  heroColon: {
    fontSize: 36,
    fontWeight: '900',
    color: '#C5A059',
  },
  quickPresetsHeaderRow: {
    marginBottom: 12,
  },
  quickPresetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickPresetsChipsScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  quickPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  quickPresetChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  quickPresetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  quickPresetChipTextActive: {
    color: '#FFFFFF',
  },
  segmentedTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    gap: 4,
    marginBottom: 12,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentedTabActive: {
    backgroundColor: '#C5A059',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
  },
  selectionBody: {
    minHeight: 180,
    justifyContent: 'center',
  },
  hourGridContainer: {
    gap: 8,
  },
  minuteGridContainer: {
    gap: 8,
  },
  gridHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gridHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  primeHintBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primeHintBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  minuteStepBtnsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  minuteStepBtn: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  minuteStepBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  hourBadge: {
    width: '14.5%',
    aspectRatio: 1.15,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourBadgePrime: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FDE68A',
  },
  hourBadgeSelected: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  hourBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  hourBadgeTextPrime: {
    color: '#B45309',
    fontWeight: '800',
  },
  hourBadgeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  minutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  minuteBadge: {
    width: '23%',
    aspectRatio: 1.4,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minuteBadgeSelected: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  minuteBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  minuteBadgeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
