# Suzitta

Akademik, oyunlaştırılmış ve Arapça köprüleri destekleyen Türkçe öğrenme uygulaması.

## GitHub üzerinden yayınlama

Bu proje statik bir web uygulamasıdır. `singtr/` klasöründeki `index.html`, `styles.css`, `app.js` ve `database.js` dosyaları doğrudan tarayıcıda çalışır.

En profesyonel öneri: **GitHub Pages'i GitHub Actions ile yayınlamak**. Bu repoda `.github/workflows/pages.yml` dosyası eklidir; `main`, `master` veya `work` branch'ine push geldiğinde `singtr/` klasörünü GitHub Pages'e otomatik deploy eder.

### Kurulum adımları

1. GitHub'da repoyu aç.
2. **Settings → Pages** bölümüne git.
3. **Build and deployment → Source** alanını **GitHub Actions** yap.
4. Değişiklikleri `main`, `master` veya `work` branch'ine push et.
5. **Actions** sekmesinde “Deploy Turkish Learning App to GitHub Pages” workflow'unun bitmesini bekle.
6. Yayın linki workflow sonunda ve **Settings → Pages** ekranında görünür.

## Neden “Deploy from branch” yerine GitHub Actions?

- `singtr/` klasörünü site kökü olarak yayınlar; kullanıcı doğrudan yayın URL'sinden uygulamayı açabilir.
- Her push'ta dosya varlığını kontrol eder.
- İleride test, kalite kontrol veya build adımı eklemek daha kolaydır.
- Yayın süreci GitHub Actions kayıtlarında şeffaf şekilde görünür.

Basit ve hızlı bir demo gerekiyorsa “Deploy from branch” de çalışabilir; fakat bu repo için önerilen yöntem **GitHub Actions**'tır.
