import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function MyCardsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('cards'); // cards, transactions

  // Mock kart verileri
  const cards = [
    {
      id: '1',
      type: 'credit',
      cardNumber: '**** **** **** 1234',
      cardholderName: 'Ahmet Yılmaz',
      expiryDate: '12/26',
      isDefault: true,
      bankName: 'Garanti BBVA',
      cardColor: '#1E40AF',
      logo: '💳'
    },
    {
      id: '2',
      type: 'debit',
      cardNumber: '**** **** **** 5678',
      cardholderName: 'Ahmet Yılmaz',
      expiryDate: '09/25',
      isDefault: false,
      bankName: 'İş Bankası',
      cardColor: '#059669',
      logo: '💳'
    },
    {
      id: '3',
      type: 'credit',
      cardNumber: '**** **** **** 9012',
      cardholderName: 'Ahmet Yılmaz',
      expiryDate: '03/27',
      isDefault: false,
      bankName: 'Yapı Kredi',
      cardColor: '#DC2626',
      logo: '💳'
    },
  ];

  // Mock işlem geçmişi
  const transactions = [
    {
      id: '1',
      type: 'payment',
      amount: '₺ 8.500',
      date: '15.08.2025',
      time: '14:30',
      status: 'completed',
      description: 'Koç Kurbanı - Türkiye',
      cardNumber: '**** 1234'
    },
    {
      id: '2',
      type: 'payment',
      amount: '₺ 17.000',
      date: '10.08.2025',
      time: '11:15',
      status: 'completed',
      description: 'Büyükbaş Kurbanı - Somali',
      cardNumber: '**** 5678'
    },
    {
      id: '3',
      type: 'refund',
      amount: '₺ 6.500',
      date: '05.08.2025',
      time: '16:45',
      status: 'completed',
      description: 'Koyun Kurbanı - Bangladeş (İade)',
      cardNumber: '**** 9012'
    },
  ];

  function CardItem({ card }) {
    const handleSetDefault = () => {
      Alert.alert(
        'Varsayılan Kart',
        `${card.bankName} kartını varsayılan ödeme yöntemi yapmak istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Evet', 
            onPress: () => {
              // Burada gerçek varsayılan kart ayarlama işlemi yapılacak
              Alert.alert('Başarılı', 'Varsayılan kart güncellendi!');
            }
          }
        ]
      );
    };

    const handleDelete = () => {
      Alert.alert(
        'Kartı Sil',
        `${card.bankName} kartını silmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Sil', 
            style: 'destructive',
            onPress: () => {
              // Burada gerçek kart silme işlemi yapılacak
              Alert.alert('Başarılı', 'Kart silindi!');
            }
          }
        ]
      );
    };

    return (
      <View style={[styles.cardItem, { backgroundColor: card.cardColor }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLogo}>{card.logo}</Text>
          <View style={styles.cardActions}>
            {!card.isDefault && (
              <TouchableOpacity onPress={handleSetDefault} style={styles.actionButton}>
                <Ionicons name="star-outline" size={16} color={colors.surface} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={16} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardholderLabel}>Kart Sahibi</Text>
              <Text style={styles.cardholderName}>{card.cardholderName}</Text>
            </View>
            <View>
              <Text style={styles.expiryLabel}>Son Kullanma</Text>
              <Text style={styles.expiryDate}>{card.expiryDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.bankName}>{card.bankName}</Text>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Ionicons name="star" size={12} color={card.cardColor} />
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  function TransactionItem({ transaction }) {
    const statusColor = transaction.status === 'completed' ? '#16A34A' : '#F59E0B';
    const statusText = transaction.status === 'completed' ? 'Tamamlandı' : 'İşleniyor';
    const typeIcon = transaction.type === 'payment' ? 'arrow-down' : 'arrow-up';
    const typeColor = transaction.type === 'payment' ? '#DC2626' : '#16A34A';
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Ionicons name={typeIcon} size={20} color={typeColor} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionCard}>{transaction.cardNumber}</Text>
          <Text style={styles.transactionDate}>{transaction.date} - {transaction.time}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: typeColor }]}>{transaction.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kartlarım</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cards' && styles.activeTab]} 
          onPress={() => setActiveTab('cards')}
        >
          <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>Kartlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTab]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>İşlemler</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'cards' ? (
          cards.length > 0 ? (
            <>
              <View style={styles.cardsContainer}>
                {cards.map(card => (
                  <CardItem key={card.id} card={card} />
                ))}
              </View>
              <TouchableOpacity style={styles.addCardButton}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.addCardText}>Yeni Kart Ekle</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Henüz Kart Eklenmemiş</Text>
              <Text style={styles.emptySubtitle}>Ödeme yapmak için bir kart ekleyin</Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Kart Ekle</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          transactions.length > 0 ? (
            transactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Henüz İşlem Yok</Text>
              <Text style={styles.emptySubtitle}>Kurban bağışı yaptığınızda işlemler burada görünecek</Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Kurban')}
              >
                <Text style={styles.ctaButtonText}>Şimdi Kurban Bağışla</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  addButton: { padding: 8 },
  
  tabContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 8,
    marginHorizontal: 4
  },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: colors.surface, fontWeight: '700' },
  
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  
  cardsContainer: { marginBottom: 24 },
  cardItem: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  cardLogo: { fontSize: 32 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8 },
  
  cardBody: { marginBottom: 20 },
  cardNumber: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: colors.surface, 
    marginBottom: 20,
    letterSpacing: 2
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  cardholderLabel: { fontSize: 12, color: colors.surface, opacity: 0.8 },
  cardholderName: { fontSize: 16, fontWeight: '600', color: colors.surface },
  expiryLabel: { fontSize: 12, color: colors.surface, opacity: 0.8 },
  expiryDate: { fontSize: 16, fontWeight: '600', color: colors.surface },
  
  cardInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  bankName: { fontSize: 14, fontWeight: '600', color: colors.surface },
  defaultBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surface, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    gap: 4
  },
  defaultText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  
  addCardButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.surface, 
    paddingVertical: 16, 
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8
  },
  addCardText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  
  transactionItem: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  transactionIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F3F4F6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  transactionInfo: { flex: 1 },
  transactionDescription: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  transactionCard: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  transactionDate: { fontSize: 12, color: '#9CA3AF' },
  transactionAmount: { alignItems: 'flex-end' },
  amountText: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 64,
    paddingHorizontal: 32
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  ctaButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 12 
  },
  ctaButtonText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
});
