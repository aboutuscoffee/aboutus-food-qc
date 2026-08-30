export const STORES = ['伏見', '二条'];

export const CATEGORIES = ['仕込み', 'フード', 'スイーツ'];

export const MENUS = {
  仕込み: ['フレンチトースト', 'レーズンバターサンド', 'カッサータ', 'バスクチーズケーキ'],
  フード: ['カプレーゼサンド', 'ジャンボンフロマージュ', 'ルーベンサンド', 'ケークサレ', 'バナナブレッド', 'フレンチトースト'],
  スイーツ: ['レーズンバターサンド', 'カッサータ', 'バスクチーズケーキ', 'レモンパウンド', 'チーズケーキ盛り合わせ', 'チーズケーキとパウンド盛り合わせ'],
};

// お手本タブ専用の分類構造（新規記録・履歴のCATEGORIES/MENUSとは独立）。
// 「仕込み」＝工程チェック用ポイント、「提供」＝盛り付け確認用ポイント。
// 同じ商品名でも purpose が違えばポイントは別リストとして管理される。
export const REFERENCE_GROUPS = [
  {
    key: 'prep',
    label: '仕込み',
    purpose: 'prep',
    dishes: ['レーズンバターサンド', 'カッサータ', 'バスクチーズケーキ'],
  },
  {
    key: 'serving',
    label: '提供',
    purpose: 'serving',
    subgroups: [
      {
        key: 'sweets',
        label: 'スイーツ',
        dishes: [
          'レーズンバターサンド',
          'カッサータ',
          'バスクチーズケーキ',
          'パイナップル',
          'レモンパウンド',
          'チーズケーキ盛り合わせ',
          'チーズケーキとパウンドの盛り合わせ',
        ],
      },
      {
        key: 'food',
        label: 'フード',
        dishes: ['フレンチトースト', '季節のフレンチトースト', 'ルーベンサンド', 'カプレーゼサンド', 'ジャンボンフロマージュ', 'ケークサレ', 'バナナブレッド'],
      },
    ],
  },
];

// 新規記録/履歴のカテゴリ（仕込み/フード/スイーツ）から、お手本の purpose を決める。
// 仕込みカテゴリのログ→仕込みポイント、フード/スイーツのログ→提供ポイントを見せる。
export function purposeForCategory(category) {
  return category === '仕込み' ? 'prep' : 'serving';
}

export const MANAGER_PIN = import.meta.env.VITE_MANAGER_PIN || '1234';

// 保存時にQCログの通知を受け取るスタッフ（aboutus-staff-todoの notifications テーブルへinsert）
export const NOTIFY_STAFF_KEY = 'staff_1783595020166'; // 松田夕奈
