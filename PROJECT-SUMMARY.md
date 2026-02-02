# US Visa Bot - Web Manager - Итоговая документация

## Что было создано

Из консольного бота для переноса записей на визу США было создано полноценное веб-приложение для управления несколькими клиентами одновременно.

## Технологический стек

### Backend
- **Node.js** + **Express** - REST API сервер
- **WebSocket (ws)** - Real-time коммуникация
- **better-sqlite3** - Локальная база данных
- **Child Processes** - Запуск независимых ботов для каждого клиента

### Frontend
- **React 18** - UI библиотека
- **Vite** - Сборщик и dev-сервер
- **Чистый CSS** - Стилизация (без frameworks)
- **WebSocket Client** - Real-time обновления

## Архитектура

```
us-visa-bot-main/
├── server/                      # Backend приложение
│   ├── db/
│   │   └── database.js         # SQLite инициализация и схема
│   ├── routes/
│   │   └── clients.js          # REST API endpoints
│   ├── services/
│   │   └── BotManager.js       # Управление процессами ботов
│   └── server.js               # Express сервер + WebSocket
│
├── client/                      # Frontend приложение
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientsTable.jsx      # Таблица клиентов
│   │   │   ├── ClientsTable.css
│   │   │   ├── EditModal.jsx         # Модальное окно редактирования
│   │   │   ├── EditModal.css
│   │   │   ├── LogsPanel.jsx         # Панель логов
│   │   │   └── LogsPanel.css
│   │   ├── services/
│   │   │   └── api.js                # API клиент
│   │   ├── utils/
│   │   │   └── date.js               # Утилиты для работы с датами
│   │   ├── App.jsx                   # Главный компонент
│   │   ├── App.css
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── src/                         # Оригинальный код бота (переиспользуется)
│   ├── commands/
│   │   ├── bot.js              # Оригинальная логика бота
│   │   └── bot-worker.js       # Worker для child process (NEW)
│   ├── lib/
│   │   ├── bot.js              # Bot класс
│   │   ├── client.js           # HTTP клиент для visa API
│   │   ├── config.js           # Конфигурация
│   │   └── utils.js            # Утилиты
│   └── index.js                # CLI entry point
│
├── package.json                 # Root package.json
├── README.md                    # Оригинальное README
├── README-WEB.md               # Документация веб-версии
└── QUICKSTART.md               # Быстрый старт

```

## Ключевые компоненты

### 1. Bot Manager (server/services/BotManager.js)

Центральный компонент для управления ботами:
- Запускает каждого бота как отдельный child process
- Отслеживает статус каждого бота (running/stopped)
- Собирает логи от каждого процесса
- Транслирует обновления через WebSocket
- Обеспечивает graceful shutdown

**Ключевые методы:**
- `start(client)` - запустить бота для клиента
- `stop(clientId)` - остановить бота
- `isRunning(clientId)` - проверить статус
- `getStatus(clientId)` - получить статус и последний лог
- `handleLog(clientId, message)` - обработать новый лог

### 2. REST API (server/routes/clients.js)

CRUD операции для клиентов:
- `GET /api/clients` - список всех клиентов
- `GET /api/clients/:id` - данные клиента
- `POST /api/clients` - создать клиента
- `PUT /api/clients/:id` - обновить клиента
- `DELETE /api/clients/:id` - удалить клиента
- `POST /api/clients/:id/start` - запустить бота
- `POST /api/clients/:id/stop` - остановить бота
- `GET /api/clients/:id/logs` - получить историю логов

### 3. WebSocket Server (server/server.js)

Real-time коммуникация:
- Отправляет начальный статус при подключении
- Транслирует обновления статуса ботов
- Отправляет новые логи в реальном времени

**Типы сообщений:**
```javascript
// Начальный статус
{ type: 'initial_status', data: { clientId: { running, lastLog }, ... } }

// Обновление статуса
{ type: 'status', clientId: 123, data: { running: true, lastLog: {...} } }

// Новый лог
{ type: 'log', clientId: 123, data: { message: "...", timestamp: "..." } }
```

### 4. Database Schema (server/db/database.js)

**Таблица `clients`:**
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  country_code TEXT NOT NULL,
  schedule_id TEXT NOT NULL,
  facility_id TEXT NOT NULL,
  current_date TEXT NOT NULL,
  target_date TEXT,
  min_date TEXT,
  refresh_delay INTEGER DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Таблица `logs`:**
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
)
```

### 5. React Components

**App.jsx** - главный компонент:
- Управляет состоянием приложения
- Подключается к WebSocket
- Координирует все дочерние компоненты

**ClientsTable.jsx** - таблица клиентов:
- Отображает список всех клиентов
- Кнопки START/STOP с цветовой индикацией
- Кнопки редактирования и удаления
- Превью последнего лога

**EditModal.jsx** - модальное окно:
- Форма для создания/редактирования клиента
- Валидация данных
- Работа с датами через HTML5 date picker

**LogsPanel.jsx** - панель логов:
- Отображает историю логов клиента
- Real-time обновления через WebSocket
- Автоскролл к новым логам
- Цветовая индикация уровня лога (error/warning/success/info)

## Как это работает

### Жизненный цикл бота

1. **Пользователь создает клиента** через форму
   → Данные сохраняются в SQLite

2. **Пользователь нажимает START**
   → `POST /api/clients/:id/start`
   → BotManager создает child process с bot-worker.js
   → Process передаются env переменные (email, password, etc.)

3. **Bot worker запускается**
   → Использует оригинальную логику бота
   → Выводит логи в stdout
   → Parent process читает stdout

4. **BotManager обрабатывает логи**
   → Сохраняет в базу данных
   → Обновляет lastLog в памяти
   → Транслирует через WebSocket

5. **Frontend получает обновления**
   → WebSocket message приходит в App.jsx
   → Обновляется состояние
   → React перерисовывает UI

6. **Пользователь нажимает STOP**
   → `POST /api/clients/:id/stop`
   → BotManager отправляет SIGTERM процессу
   → Process завершается
   → Статус обновляется

### WebSocket Flow

```
Client (Browser)          Server (Express)         BotManager
       |                         |                       |
       |--- connect ------------->|                       |
       |<-- initial_status -------|                       |
       |                          |                       |
       |--- POST /start --------->|--- start() -------->  |
       |                          |                   [fork process]
       |<-- status: running ------|<-- broadcast -----    |
       |                          |                       |
       |                          |<-- log event -----    |
       |<-- new log --------------|<-- broadcast -----    |
       |                          |                       |
```

## Особенности реализации

### 1. Child Process Management

Каждый бот запускается как независимый процесс:
- Изолированное выполнение
- Собственное окружение (env vars)
- Не блокирует основное приложение
- Легко масштабируется

### 2. Real-time Updates

WebSocket обеспечивает моментальную передачу:
- Статусов ботов
- Новых логов
- Автоматическое переподключение при обрыве

### 3. Local-first Architecture

Все данные хранятся локально:
- SQLite база в файловой системе
- Нет внешних зависимостей
- Полный контроль над данными
- Работает offline (после первой установки)

### 4. Graceful Shutdown

При остановке приложения:
- Все боты корректно останавливаются
- Процессы получают SIGTERM
- База данных закрывается правильно

## Запуск и использование

### Установка
```bash
npm run install:all
```

### Разработка
```bash
npm run dev
```
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Production build
```bash
npm run build
```
Создаст статические файлы в `client/dist/`

## Безопасность

⚠️ **Важные моменты:**

1. **Пароли в открытом виде** - хранятся в SQLite без шифрования
2. **Локальная сеть только** - не предназначено для публичного доступа
3. **Файл базы данных** - содержит чувствительную информацию
4. **CORS открыт** - настроен для локальной разработки

## Возможные улучшения

### Безопасность
- [ ] Шифрование паролей в базе данных
- [ ] Аутентификация для доступа к веб-интерфейсу
- [ ] HTTPS для production

### Функциональность
- [ ] Экспорт/импорт клиентов
- [ ] Фильтрация и поиск в таблице
- [ ] Статистика по успешным бронированиям
- [ ] Email/Telegram уведомления при успехе
- [ ] Настройка расписания запуска ботов
- [ ] Темная тема UI

### Масштабируемость
- [ ] Pagination для больших списков
- [ ] Виртуализация таблицы
- [ ] Очистка старых логов
- [ ] Backup/restore базы данных

## Лицензия

ISC License (как и оригинальный проект)

## Автор

Создано на основе оригинального US Visa Bot
Web-версия: Claude Code + разработчик
