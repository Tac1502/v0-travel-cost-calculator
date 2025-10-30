<h1 align="center"> 旅行経路＋費用算出アプリ — <br/>Travel Cost Estimator</h1>

<p align="center">
  出発地と目的地を入力するだけで、<b>高速料金・燃料費・レンタカー・駐車場代</b>などを自動で計算。<br/>
  総費用と割り勘金額を一目で把握できる「旅の事前見積り」アプリです。
</p>

##  概要
出発地と目的地を入力すると、Google Mapsから**距離・所要時間**を取得し、  
**燃料費 / 高速料金 / レンタカー / 駐車場**を合算。**総額**と**割り勘**を表示します。  
旅行や出張の**事前見積もり**を簡単・綺麗に。

> 例）距離×燃費×燃料単価＋高速料金係数＋レンタカー＋駐車場 → **総額** → 人数で割って**1人あたり**

---

![アプリ画像](https://i.gyazo.com/ceff1d9d7f03b3ff1b2791499d518d48.png)

##  サイトURL
　　https://travel-cost-calculator-nu.vercel.app/

##  主な機能
-  **経路検索**：Google Maps Directions/Places APIで**距離・所要時間**を自動取得  (開発中)
-  **費用算出**：`距離 × (燃料単価 / 燃費) + 高速料金 + レンタカー + 駐車場` を概算  
-  **割り勘計算**：人数入力で**1人あたり金額**を自動算出  
-  **車両プリセット**：よく使う車の**燃費・種別**を保存して即呼び出し  (開発中)
-  **旅の履歴保存**：Supabaseに**過去の計算結果**を保存・参照  (開発中)
-  **設定管理**：**燃料単価**や**端数処理（四捨五入/切り上げ/切り捨て）**をユーザー単位で記憶  (開発中)
-  **認証**：**Supabase Auth**でログイン/ログアウト

---

##  算出ロジック（概要）
distance_km: Google Maps API から取得
fuel_cost = distance_km / fuel_efficiency_km_per_L * fuel_price_per_L
toll_cost ≈ distance_km × toll_coefficient （地域/道路実費に合わせ係数調整）
rent_cost = 任意（レンタカー利用時の固定/日割り）
parking = 任意（目的地や時間に応じて固定/概算）
total = fuel_cost + toll_cost + rent_cost + parking
per_person = ceil|round|floor( total / people )

---

##  技術スタック
- **フロントエンド**：Next.js / TypeScript / Tailwind CSS / v0  
- **バックエンド**：Supabase（Auth / Database / Storage）  
- **外部API**：Google Maps Platform（Directions / Places）  
- **開発支援**：Figma（UI設計）/ GitHub（バージョン管理）
