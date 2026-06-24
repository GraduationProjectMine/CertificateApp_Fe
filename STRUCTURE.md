# CertiChain FE — Cấu trúc & Workflow

## Kiến trúc tổng quan

```
src/
├── app/                    # Next.js App Router — CHỈ routing, KHÔNG logic
│   ├── admin/              #   Route /admin/*
│   ├── auth/               #   Route /auth/*
│   ├── student/            #   Route /student/*
│   ├── employer/           #   Route /employer/*
│   ├── super-admin/        #   Route /super-admin/*
│   ├── public/             #   Route /public/*
│   ├── api/                #   Route /api/* (server actions)
│   ├── layout.tsx          #   Root layout (providers)
│   └── page.tsx            #   Landing page
├── features/               # Domain logic theo module
│   ├── auth/               #   Xác thực & phân quyền
│   ├── certificates/       #   Văn bằng (types, API, components, schemas)
│   ├── students/           #   Sinh viên (types)
│   ├── audit-logs/         #   Nhật ký (types)
│   ├── verification/       #   Xác minh (types)
│   ├── theme/              #   Dark/light mode
│   └── i18n/               #   Đa ngôn ngữ
├── components/             # Shared UI components
│   ├── ui/                 #   Base UI kit (button, card, input...)
│   ├── common/             #   Patterns (Loading, EmptyState...)
│   └── motion/             #   Animation wrapper
├── hooks/                  # Custom React hooks
├── lib/                    # Utility thuan (validators, permissions, env...)
├── utils/                  # Helper functions (cn, format-date...)
├── blockchain/             # Web3 provider & contract interaction
├── ipfs/                   # IPFS client & metadata builder
└── store/                  # Zustand stores (auth, wallet)
```

## Nguyên tắc làm việc

### 1. Mọi logic nằm trong `features/`, không nằm trong `app/`

**Đúng:**
```
features/products/
  types.ts           ← định nghĩa TypeScript
  services/api.ts    ← gọi API backend
  components/        ← component thuần (UI + logic)

app/admin/products/page.tsx  ← chỉ 5-10 dòng: import + render
```

**Sai:**
```
app/admin/products/page.tsx  ← 200 dòng: mock data + HTML + state
```

### 2. Route = folder + page.tsx

| Folder | Route |
|---|---|
| `app/admin/certificates/page.tsx` | `/admin/certificates` |
| `app/admin/certificates/[id]/page.tsx` | `/admin/certificates/:id` |
| `app/admin/certificates/issue/page.tsx` | `/admin/certificates/issue` |

### 3. Thêm tính năng mới (4 bước)

```
1. src/features/xxx/
     types.ts          ← interface/types
     services/api.ts   ← fetch từ backend

2. src/features/xxx/components/
     XxxList.tsx       ← component UI + logic

3. src/app/admin/xxx/page.tsx
     import { XxxList } from '@/features/xxx/components'
     export default function Page() { return <XxxList /> }

4. src/app/admin/layout.tsx  ← menuItems[] thêm mục sidebar
```

### 4. Import path

Dùng `@/` alias (đã cấu hình trong tsconfig.json):

```tsx
// Đúng
import { useAuth } from '@/features/auth/components/AuthContext'

// Sai (tránh)
import { useAuth } from '../../../features/auth/components/AuthContext'
```

### 5. Khi nào tạo file gì

| Bạn cần | Tạo ở |
|---|---|
| Định nghĩa interface/type | `features/xxx/types.ts` |
| Gọi API backend | `features/xxx/services/api.ts` |
| UI component có logic | `features/xxx/components/` |
| UI component chung (dùng nhiều nơi) | `components/ui/` hoặc `components/common/` |
| Hook dùng chung | `hooks/use-xxx.ts` |
| Hàm thuần (format, parse) | `utils/xxx.ts` |
| Hằng số | `constants/xxx.ts` |
| Trạng thái app (Zustand) | `store/xxx.store.ts` |

### 6. DRY — tránh trùng lặp

- **Type chỉ viết 1 lần** trong `features/xxx/types.ts`, không viết lại ở `page.tsx`
- **API call chỉ viết 1 lần** trong `features/xxx/services/api.ts`, không fetch trực tiếp trong page
- **UI component chung** dùng từ `components/ui/`, không tự code lại button/input mỗi lần
