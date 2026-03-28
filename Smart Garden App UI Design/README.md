# Smart Garden Mobile App

Мобилното приложение на **Soilix / Smart Garden** е разработено с **Expo + React Native + TypeScript** и служи за наблюдение и управление на интелигентни градински устройства. Приложението се свързва с отделен backend API, който отговаря за автентикация, свързване на устройства и извличане на live и historical сензорни данни.

## Основни възможности

- Регистрация и вход на потребители
- Свързване към съществуващо устройство чрез валиден `device_id`
- Разкачване на устройство от текущия потребител
- Преглед на live стойности за:
  - температура на въздуха
  - влажност на въздуха
  - атмосферно налягане
  - влажност на почвата
  - температура на почвата
- Преглед на исторически данни и статистики по избран времеви диапазон

## Технологичен стек

- **React Native**
- **Expo**
- **TypeScript**
- **React Navigation**
- **react-native-svg**
- **expo-linear-gradient**
- Интеграция с външен backend API

## Структура на проекта

- [App.tsx](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/App.tsx)  
  Входна точка на приложението.

- [src/navigation](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/src/navigation)  
  Навигация между екраните и табовете.

- [src/screens](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/src/screens)  
  Основните екрани на приложението.

- [src/context](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/src/context)  
  Глобално състояние за автентикация и устройства.

- [src/config/api.ts](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/src/config/api.ts)  
  Централна конфигурация за API заявки.

- [src/components](/C:/Users/katie/Downloads/Soilix_HackTUES12/Smart%20Garden%20App%20UI%20Design/src/components)  
  Повторно използваеми UI компоненти.

## Изисквания

За локално стартиране са необходими:

- **Node.js**
- **npm**
- **Expo CLI** чрез `npx expo`
- За Android:
  - **Android Studio**
  - **Android SDK**
  - **JDK**
- По желание:
  - физически телефон с инсталирано **Expo Go**

## Инсталация

Отворете терминал в папката на мобилното приложение:

```powershell
cd "C:\Users\Username\Downloads\Soilix_HackTUES12\Smart Garden App UI Design"
```

Инсталирайте зависимостите:

```powershell
npm.cmd install
```

## Конфигурация на средата

Приложението използва `EXPO_PUBLIC_API_URL`, за да определи към кой backend да изпраща заявките.

### Примерна конфигурация

```env
EXPO_PUBLIC_API_URL=https://soilix-public-api.onrender.com
```

### Препоръчителни среди

- **Development**  
  Локален backend или тестов deploy

- **Staging**  
  Публична тестова среда преди финално пускане

- **Production**  
  Финалният публичен backend


## Стартиране на приложението

### 1. Стартиране на Expo development server

```powershell
npx.cmd expo start
```

или:

```powershell
npm.cmd run start
```

### 2. Стартиране на Android емулатор

След стартиране на Expo:

- натиснете `a` в терминала
- или стартирайте емулатора ръчно през Android Studio

### 3. Стартиране в уеб режим

```powershell
npm.cmd run web
```

### 4. Стартиране като native Android build

```powershell
npm.cmd run android
```

Този режим използва native Android toolchain и изисква правилно конфигурирани:

- Android SDK
- JDK
- Gradle

## Стартиране на телефон с QR код

За тест на физически телефон:

1. Инсталирайте **Expo Go**
2. Стартирайте:

```powershell
npx.cmd expo start
```

3. Уверете се, че телефонът и компютърът са в една и съща мрежа
4. Сканирайте QR кода

## Полезни npm команди

```powershell
npm.cmd run start
npm.cmd run android
npm.cmd run ios
npm.cmd run web
```

## API интеграция



Основни API потоци:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/devices/live`
- `POST /api/devices/connect`
- `POST /api/devices/disconnect`
- `GET /api/devices/<device_id>/history`

## Свързване на устройство

Важно: приложението **не създава нови устройства**. Потребителят може само да се свърже към вече съществуващо устройство, ако:

- подаде валиден `device_id`
- устройството няма текущ owner

Един потребител може да бъде свързан към повече от едно устройство, стига устройствата да са свободни.

## Исторически данни и статистики

Статистиките се зареждат от backend endpoint за история на устройство и поддържат следните диапазони:

- `10 minutes`
- `30 minutes`
- `1 hour`
- `1 day`

Тези стойности трябва да бъдат поддържани и от backend-а.

## Често срещани проблеми

### 1. `package.json does not exist`

Причина: Expo е стартирано от грешна папка.

Решение:

```powershell
cd "C:\Users\Username\Downloads\Soilix_HackTUES12\Smart Garden App UI Design"
npx.cmd expo start
```

### 2. Android емулаторът няма интернет

Проверете:

- дали емулаторът има достъп до браузър
- дали няма проблем с ADB
- дали не е нужен `Cold Boot` или `Wipe Data`

### 3. `Network request failed`

Проверете:

- дали backend-ът е достъпен
- дали `EXPO_PUBLIC_API_URL` сочи към правилния адрес
- дали използвате актуалната deploy версия на backend-а

### 4. Native Android build не тръгва

Проверете:

- `JAVA_HOME`
- Android SDK path
- `android/local.properties`


## Версия

- App version: `1.0.0`
- Expo name: `Smart Garden`
- Android package: `com.anonymous.smartgardennative`

## EAS Build

Проектът съдържа eas.json с базови build профили.

### Примерни команди

Development build:

```powershell
eas build --platform android --profile development
```

Preview APK build:

```powershell
eas build --platform android --profile preview
```

Production Android build:

```powershell
eas build --platform android --profile production
```

### Профили

- `development`  
  За development client и вътрешно тестване

- `preview`  
  За бърз Android `apk` build

- `production`  
  За production Android `aab` build
