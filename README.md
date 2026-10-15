# YouTube Transcript Extractor

এটি একটি Node.js প্রজেক্ট, যা YouTube ভিডিওর ক্যাপশন (ট্রান্সক্রিপ্ট) বের করে দেয়। ম্যানুয়ালি আপলোড করা ক্যাপশন এবং YouTube-এর অটো-জেনারেটেড ক্যাপশন, দুটোই কাজ করে। এটি দুইভাবে চালানো যায়: কমান্ড লাইন টুল (CLI) হিসেবে এবং REST API সার্ভার হিসেবে।

## মূল ফিচার

- watch, `youtu.be`, shorts, embed ও live লিংক অথবা ১১ অক্ষরের ভিডিও ID, সবকিছু সাপোর্ট করে
- আউটপুট ফরম্যাট: `text` (সাধারণ লেখা), `json` (সময়সহ), `srt` ও `vtt` (সাবটাইটেল ফাইল)
- ভাষার অগ্রাধিকার দেওয়া যায়, যেমন `bn,en`। কাঙ্ক্ষিত ভাষা না থাকলে ভিডিওর ডিফল্ট ভাষায় ফিরে যায়
- ভিডিওতে কোন কোন ক্যাপশন ভাষা আছে তার তালিকা দেখা যায়
- কোনো থার্ড-পার্টি স্ক্র্যাপার প্যাকেজ ছাড়াই সরাসরি YouTube থেকে ক্যাপশন আনে
- ক্যাশ, রেট লিমিট ও স্পষ্ট এরর কোড আছে

## প্রয়োজনীয়তা

Node.js 18.17 বা তার নতুন ভার্সন। ভার্সন দেখতে:
```bash
node -v
```

## সেটআপ

প্রজেক্ট ফোল্ডারে গিয়ে একবার ডিপেন্ডেন্সি ইনস্টল করুন:
```bash
npm install
```
সেটিং পরিবর্তন করতে চাইলে (ঐচ্ছিক):
```bash
cp .env.example .env
```
Windows Command Prompt-এ `cp` কাজ না করলে এটি ব্যবহার করুন:
```bash
copy .env.example .env
```

## CLI হিসেবে ব্যবহার

ভিডিওর ক্যাপশন ভাষার তালিকা দেখুন:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" --list
```

সাধারণ লেখা হিসেবে টার্মিনালে দেখুন:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw"
```

টেক্সট ফাইলে সেভ করুন:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -o transcript.txt
```

সময়সহ SRT সাবটাইটেল ফাইল বানান:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -f srt -o captions.srt
```

VTT ফাইল বানান:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -f vtt -o captions.vtt
```

JSON (প্রতিটি লাইনের `timestamp` ও `start` সহ) বানান:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -f json -o transcript.json
```

ভাষার অগ্রাধিকার দিন (বাংলা আগে, তারপর ইংরেজি):
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -f json -l bn,en
```

ভাষা না পেলে ফলব্যাক না করে এরর দেখান:
```bash
node extract.js "https://www.youtube.com/watch?v=Rq1II71_Glw" -l fr --no-fallback
```

সব অপশনের সহায়তা দেখুন:
```bash
node extract.js --help
```

## API সার্ভার হিসেবে ব্যবহার

সার্ভার চালু করুন (ডিফল্ট `http://localhost:3000`):
```bash
npm start
```

অন্য টার্মিনাল থেকে ট্রান্সক্রিপ্ট আনুন:
```bash
curl -X POST http://localhost:3000/api/transcript -H "Content-Type: application/json" -d '{"videoUrl":"https://youtu.be/Rq1II71_Glw","format":"text","lang":"en"}'
```

ব্রাউজারে সরাসরি খুলতে:
```
http://localhost:3000/api/transcript?videoUrl=Rq1II71_Glw&format=text
```

উপলব্ধ ভাষার তালিকা:
```
http://localhost:3000/api/languages?videoUrl=Rq1II71_Glw
```

সার্ভার বন্ধ করতে টার্মিনালে `Ctrl + C` চাপুন।

## টেস্ট চালানো

নেটওয়ার্ক ছাড়াই চলে এমন টেস্ট:
```bash
npm test
```

## সীমাবদ্ধতা

- শুধু YouTube-এ আগে থেকে থাকা ক্যাপশন পাওয়া যায়। ক্যাপশন নেই এমন ভিডিওর জন্য স্পিচ-টু-টেক্সট নেই।
- অনুবাদের সুবিধা নেই। `-l en` দিলে ইংরেজি ট্র্যাক না থাকলে ভিডিওর নিজের ভাষাই আসে।
- `text` ফরম্যাটে সময় থাকে না। সময় চাইলে `srt`, `vtt` বা `json` ব্যবহার করুন।
- YouTube-এর অনানুষ্ঠানিক এন্ডপয়েন্ট ব্যবহার করা হয়, তাই YouTube কিছু বদলালে টুল কাজ বন্ধ করতে পারে।
- ক্লাউড সার্ভার, VPS বা VPN-এর IP প্রায়ই ব্লক হয় (`RATE_LIMITED` বা `UPSTREAM_BLOCKED` এরর)। বাসার ইন্টারনেটে সাধারণত ঠিকমতো চলে।
- ভিডিও ডাউনলোড করে না, শুধু ট্রান্সক্রিপ্ট বের করে।

চাইলে এই লেখাটি `README-bn.md` ফাইল হিসেবে বানিয়ে দিতে পারি, যাতে প্রজেক্ট ফোল্ডারে রেখে দিতে পারেন।
