import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleItem } from '@/types';

interface ScheduleTimelineProps {
  schedule?: ScheduleItem[];
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedule = [] }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="time-outline" size={20} color="#C5A059" />
        <Text style={styles.sectionTitle}>Etkinlik Akışı & Programı</Text>
      </View>

      <View style={styles.timeline}>
        {schedule.map((item, index) => {
          const isLast = index === schedule.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              {/* Left Column: Time */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              {/* Center Column: Dot & Connecting Line */}
              <View style={styles.lineIndicatorColumn}>
                <View style={styles.dot}>
                  <View style={styles.innerDot} />
                </View>
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Right Column: Card Content */}
              <View style={styles.contentColumn}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.cardDesc}>{item.description}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeColumn: {
    width: 60,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C5A059',
  },
  lineIndicatorColumn: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#C5A059',
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5A059',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#EFE7DA',
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FAF7F2',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
