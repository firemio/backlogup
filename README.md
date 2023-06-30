# BacklogUp

## これはなに

Backlog APIを叩いて、指定したプロジェクトのデータをバックアップします。  
バックアップしたデータは簡易ビューアで閲覧できます。

![](https://i.imgur.com/CWX1wbL.png)
![](https://i.imgur.com/ylTYYPW.png)

## バックアップの取り方

- `sample.env` を `.env` にコピー
- `.env` のコメント通りに必要事項を入力する
- `npm run backup` でバックアップを開始する

※ Backlogプロジェクトの規模によっては、バックアップに時間がかかります。

## 簡易ビューアのビルド

- `npm run build`
- `dist` ディレクトリに、バックアップも含めてアセット一式が保存されます

## ライセンス

MIT License
