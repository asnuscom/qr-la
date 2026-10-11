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
import { useRouter } from 'expo-router';
import {
  notificationService,
  InAppNotification,
} from '@/services/notificationService';

function getCategoryConfig(cat: InAppNotification['category']) {
  switch (cat) {
    case 'vehicle':
      return { icon: 'car-sport', color: '#0284C7', label: 'Araç' };
    case 'photo':
      return { icon: 'camera', color: '#C5A059', label: 'Düğün' };
    case 'pet':
      return { icon: 'paw', color: '#10B981', label: 'Pati' };
    case 'scan':
      return { icon: 'qr-code', color: '#8B5CF6', label: 'Tarama' };
    case 'order':
      return { icon: 'receipt', color: '#F59E0B', label: 'Sipariş' };
    default:
      return { icon: 'notifications', color: '#94A3B8', label: 'Sistem' };
  }
}

function formatTimeAgo(iso: string, nowMs: number) {
  const diffMs = Math.max(0, nowMs - new Date(iso).getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} gün önce`;
}

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenterModal({
  visible,
  onClose,
}: NotificationCenterModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [renderTime, setRenderTime] = useState<number>(() => Date.now());

  useEffect(() => {
    if (visible) {
      setRenderTime(Date.now());
      setNotifications(notificationService.getNotifications());
      const unsub = notificationService.subscribe((list) => {
        setNotifications(list);
      });
      return () => unsub();
    }
  }, [visible]);

  const handleNotificationPress = (item: InAppNotification) => {
    notificationService.markAsRead(item.id);
    onClose();
    if (item.url) {
      router.push(item.url as any);
    }
  };

  const handleSendTestNotification = async () => {
    const testSamples = [
      {
        title: '🚗 Aracınızın Önündeki Sürücüden Mesaj!',
        body: '34 ABC 123 plakanız için: "Aracınızı 5 dakikalığına alabilir misiniz?" bildirimi geldi.',
        category: 'vehicle' as const,
        url: '/panel/arac',
      },
      {
        title: '📸 Düğün Galerisine 5 Yeni Fotoğraf!',
        body: 'Misafirleriniz salonda yeni anılar yükledi. Canlı projeksiyonda yayında!',
        category: 'photo' as const,
        url: '/samet-ve-sule',
      },
      {
        title: '⚡ QR Kodunuz Yeni Bir Cihazdan Tarandı',
        body: 'İstanbul / Kadıköy konumundan dijital kartvizitiniz görüntülendi.',
        category: 'scan' as const,
        url: '/samet-sunman',
      },
      {
        title: '🐾 Petguru: Duman’ın Tasması Tarandı!',
        body: 'Bulan kişi GPS konumunu iletti. Haritada görüntülemek için dokunun.',
        category: 'pet' as const,
        url: '/panel/pati',
      },
    ];

    const randomPick = testSamples[Math.floor(Math.random() * testSamples.length)];
    await notificationService.triggerNotification(randomPick);
  };

  const handleEnablePermissions = async () => {
    await notificationService.registerForPushNotificationsAsync();
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.category === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellIconBox}>
                <Ionicons name="notifications" size={18} color="#C5A059" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Bildirim Merkezi</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount} Yeni</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitle}>
                  Karekod taramaları, fotoğraf yüklemeleri ve acil durum uyarıları
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* İzin İsteği Bannerı */}
          <View style={styles.permissionBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permTitle}>Anlık Push Bildirimleri</Text>
              <Text style={styles.permDesc}>
                Aracınızın camındaki QR okutulduğunda veya fotoğraflar yüklendiğinde anında sesli bildirim alın.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.permBtn}
              onPress={handleEnablePermissions}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={14} color="#090D16" />
              <Text style={styles.permBtnText}>İzin Ver</Text>
            </TouchableOpacity>
          </View>

          {/* Filtre Sekmeleri & Eylemler */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { id: 'all', label: `Tümü (${notifications.length})` },
                { id: 'unread', label: `Okunmamış (${unreadCount})` },
                { id: 'vehicle', label: '🚗 Araç' },
                { id: 'photo', label: '💍 Düğün' },
                { id: 'pet', label: '🐾 Pati' },
                { id: 'scan', label: '⚡ Tarama' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
                  onPress={() => setActiveFilter(f.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, activeFilter === f.id && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.topActionsRow}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.actionTextBtn}
                  onPress={() => notificationService.markAllAsRead()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-done-outline" size={14} color="#C5A059" />
                  <Text style={styles.actionTextBtnLabel}>Tümünü Oku</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity
                  style={styles.actionTextBtn}
                  onPress={() => notificationService.clearAll()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={13} color="#EF4444" />
                  <Text style={[styles.actionTextBtnLabel, { color: '#EF4444' }]}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bildirim Listesi */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={44} color="#334155" />
                <Text style={styles.emptyTitle}>Henüz bildirim bulunmuyor</Text>
                <Text style={styles.emptyDesc}>
                  Karekodlarınız tarandıkça veya yeni mesajlar geldikçe burada listelenecektir.
                </Text>
              </View>
            ) : (
              filtered.map((item) => {
                const conf = getCategoryConfig(item.category);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, !item.read && styles.itemCardUnread]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: `${conf.color}18` }]}>
                      <Ionicons name={conf.icon as any} size={18} color={conf.color} />
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.itemTopRow}>
                        <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemTime}>{formatTimeAgo(item.createdAt, renderTime)}</Text>
                      </View>

                      <Text style={styles.itemBody}>{item.body}</Text>

                      {item.url && (
                        <View style={styles.itemActionHint}>
                          <Text style={styles.itemActionText}>Görüntülemek için dokunun</Text>
                          <Ionicons name="arrow-forward" size={12} color="#C5A059" />
                        </View>
                      )}
                    </View>

                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer: Test Bildirimi Gönder Butonu */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleSendTestNotification}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={15} color="#C5A059" />
              <Text style={styles.testBtnText}>Canlı Test Bildirimi Tetikle (Demo)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#090D16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bellIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#090D16',
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131D31',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  permTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  permDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  permBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  permBtnText: {
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 10,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: '#C5A059',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#090D16',
    fontWeight: '800',
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
  },
  actionTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionTextBtnLabel: {
    color: '#C5A059',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 320,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  itemCardUnread: {
    borderColor: 'rgba(197, 160, 89, 0.4)',
    backgroundColor: '#131D31',
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemTime: {
    color: '#64748B',
    fontSize: 10,
    marginLeft: 8,
  },
  itemBody: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  itemActionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  itemActionText: {
    color: '#C5A059',
    fontSize: 11,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5A059',
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    borderColor: '#C5A059',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  testBtnText: {
    color: '#C5A059',
    fontSize: 12,
    fontWeight: '700',
  },
});
