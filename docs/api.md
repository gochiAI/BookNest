# API ドキュメント
詳しい内容はSwaggerで確認してください。

# `api/index`
## GET
すべての書籍の一覧を取得します。

レスポンス
書籍のリスト(json)
タイトルや著者名などの情報が含まれます。

## POST
新しい書籍を登録します。

リクエスト
title: 書籍のタイトル (必須)
authorName: 著者の名前 (必須)
publisherName: 出版社の名前 (必須)
bookTypeId: 書籍タイプのID (必須)
readStatusId: 読書状況のID (必須)
その他オプションのフィールドは省略します。

# `api/search`
## GET
書籍を検索します。
現在はタイトルのみの検索です。

クエリ
q: 検索キーワード (必須)

レスポンス
書籍のリスト(json)

