# Pokemake

慶應義塾大学のサークル[KCS](https://kcs1959.jp)のAIグループが制作した三田祭向けの作品です。

http://pokemake.kcs18.net にて体験できます。

## 開発にあたっての環境

サーバ側はPythonの軽量ウェブアプリケーションフレームワークのFlaskを使用しています。

機械学習の予測処理がPythonの深層学習フレームワーク[Keras](https://keras.io/ja/)を用いて書いたものであるので、非常に簡単にサーバ側で予測を行うことが可能です。

フロントエンド側はとりわけ何も利用していません。ajax処理を簡単に扱うためにjQueryを使用している程度です。あとは、Notificationの表示に[js-snackbar](https://www.npmjs.com/package/js-snackbar)を使っています。

CSSはBootstrapを使用しています。

http://pokemake.kcs18.net はGCP上のサービスである[Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/)(GKE)を使っています。

masterブランチにプッシュすると[Google Cloud Build](https://cloud.google.com/cloud-build/)がDockerfileを基にビルドを行います。そのイメージをGKEに適用することでサービスをデプロイしています。疑似CIもどきです。

