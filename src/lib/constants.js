export const STORES = ['伏見', '二条'];

export const CATEGORIES = ['仕込み', 'フード', 'スイーツ'];

export const MENUS = {
  仕込み: ['フレンチトースト', 'レーズンバターサンド', 'カッサータ', 'バスクチーズケーキ'],
  フード: ['カプレーゼサンド', 'ジャンボンフロマージュ', 'ルーベンサンド', 'ケークサレ', 'バナナブレッド', 'フレンチトースト'],
  スイーツ: ['レーズンバターサンド', 'カッサータ', 'バスクチーズケーキ', 'レモンパウンド', 'チーズケーキ盛り合わせ', 'チーズケーキとパウンド盛り合わせ'],
};

export const MANAGER_PIN = import.meta.env.VITE_MANAGER_PIN || '1234';

// 保存時にQCログの通知を受け取るスタッフ（aboutus-staff-todoの notifications テーブルへinsert）
export const NOTIFY_STAFF_KEY = 'staff_1783595020166'; // 松田夕奈
