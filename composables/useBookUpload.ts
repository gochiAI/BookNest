import { ref } from 'vue';
import { useToast } from 'vue-toastification';

interface Book {
    id?: number;
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    publishedYear: string;
    volume?: number;
    filters?: string[];
    selected?: boolean;
}

export default function useBookUpload() {
    const selectedBooks = ref<Book[]>([]);
    const isLoading = ref(false);
    const encoding = ref('UTF-8');
    const toast = useToast();
    
    // 補完候補の管理
    const enrichmentCandidates = ref([]);
    const currentEnrichingBook = ref(null);
    const showCandidateSelector = ref(false);
    
    // フィルター管理
    const availableFilters = ref([]);
    const selectedFilters = ref([]);

    // タイトルからフィルターを抽出
    const extractFiltersFromTitle = (title) => {
        if (!title) return [];
        
        const filters = [];
        // 【】で囲まれたパターン
        const bracketPatterns = [
            { pattern: /【分冊版】/g, name: '分冊版' },
            { pattern: /【連載版】/g, name: '連載版' },
            { pattern: /【完全版】/g, name: '完全版' },
            { pattern: /【期間限定.*?】/g, name: '期間限定' },
            { pattern: /【無料.*?版】/g, name: '無料版' },
            { pattern: /【全編無料版】/g, name: '全編無料版' },
            { pattern: /【先行配信版】/g, name: '先行配信版' },
            { pattern: /【独占配信】/g, name: '独占配信' },
            { pattern: /【特装版】/g, name: '特装版' },
            { pattern: /【限定版】/g, name: '限定版' },
            { pattern: /【廉価版】/g, name: '廉価版' },
            { pattern: /【新装版】/g, name: '新装版' },
            { pattern: /【改訂版】/g, name: '改訂版' },
            { pattern: /【文庫版】/g, name: '文庫版' },
        ];
        
        bracketPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(title) && !filters.includes(name)) {
                filters.push(name);
            }
        });
        
        // 【】なしのパターン（末尾に付く場合）
        const unbrackPatterns = [
            { pattern: /\s*連載版(\s|$|第|を|の)/, name: '連載版' },
            { pattern: /\s*分冊版(\s|$|第|を|の)/, name: '分冊版' },
            { pattern: /\s*完全版(\s|$|第|を|の)/, name: '完全版' },
            { pattern: /\s*期間限定(\s|$|第|を|の)/, name: '期間限定' },
            { pattern: /\s*記念小冊子(\s|$|第|を|の)/, name: '記念小冊子' },
            { pattern: /\s*特別版(\s|$|第|を|の)/, name: '特別版' },
            { pattern: /\s*特装版(\s|$|第|を|の)/, name: '特装版' },
            { pattern: /\s*限定版(\s|$|第|を|の)/, name: '限定版' },
            { pattern: /\s*廉価版(\s|$|第|を|の)/, name: '廉価版' },
            { pattern: /\s*新装版(\s|$|第|を|の)/, name: '新装版' },
            { pattern: /\s*改訂版(\s|$|第|を|の)/, name: '改訂版' },
            { pattern: /\s*文庫版(\s|$|第|を|の)/, name: '文庫版' },
            { pattern: /\s*無料版(\s|$|第|を|の)/, name: '無料版' },
            { pattern: /\s*先行配信版(\s|$|第|を|の)/, name: '先行配信版' },
            { pattern: /\s*独占配信(\s|$|第|を|の)/, name: '独占配信' },
        ];
        
        unbrackPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(title) && !filters.includes(name)) {
                filters.push(name);
            }
        });
        
        return filters;
    };
    
    // タイトルからフィルターを削除
    const removeFiltersFromTitle = (title) => {
        if (!title) return title;
        
        let cleanTitle = title;
        // 【...】形式のタグを全て削除
        cleanTitle = cleanTitle.replace(/【[^】]+】/g, '').trim();
        
        // （...）形式のタグを削除（例：（コミック）、（マンガ）など）
        cleanTitle = cleanTitle.replace(/（[^）]+）/g, '').trim();
        cleanTitle = cleanTitle.replace(/\([^)]+\)/g, '').trim();
        
        // 【】なしのパターンを削除
        const unbrackPatterns = [
            /\s*連載版.*$/,
            /\s*分冊版.*$/,
            /\s*完全版.*$/,
            /\s*期間限定.*$/,
            /\s*記念小冊子.*$/,
            /\s*特別版.*$/,
            /\s*特装版.*$/,
            /\s*限定版.*$/,
            /\s*廉価版.*$/,
            /\s*新装版.*$/,
            /\s*改訂版.*$/,
            /\s*文庫版.*$/,
            /\s*無料版.*$/,
            /\s*先行配信版.*$/,
            /\s*独占配信.*$/,
        ];
        
        unbrackPatterns.forEach(pattern => {
            cleanTitle = cleanTitle.replace(pattern, '');
        });
        
        // 余分なスペースを削除
        cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
        return cleanTitle;
    };

    // タイトルから巻数を抽出
    const extractVolumeFromTitle = (title) => {
        if (!title) return { title: '', volume: null };
        
        let cleanTitle = title;
        let volume = null;
        
        // 全角数字を半角に変換する関数
        const normalizeNumbers = (str) => {
            return str.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));
        };
        
        // 数字を抽出する関数（全角・半角両対応）
        const extractNumber = (str) => {
            const normalized = normalizeNumbers(str);
            const match = normalized.match(/\d+/);
            return match ? parseInt(match[0]) : null;
        };
        
        // パターン0: コロン形式（例：「タイトル: 1」または「タイトル: １」）- 末尾限定
        const pattern0 = /:\s*([０-９0-9]+)\s*$/;
        let match = pattern0.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern0, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン1: （数字）形式（例：「タイトル（1）」や「タイトル（４）」） - 末尾限定
        const pattern1 = /[（(]([０-９0-9]+)[）)]\s*$/;
        match = pattern1.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern1, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン2: [数字]形式（例：「タイトル[1]」） - 末尾限定
        const pattern2 = /\[([０-９0-9]+)\]\s*$/;
        match = pattern2.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern2, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン3: 第数字話形式（例：「第1話」「第01話」「第０１話」）- 任意位置
        const pattern3 = /第([０-９0-9]+)話/;
        match = pattern3.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern3, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン4: 数字話形式（例：「1話」「１話」「01話」） - 任意位置
        const pattern4 = /([０-９0-9]+)話/;
        match = pattern4.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern4, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン5: 第数字巻形式（例：「タイトル第1巻」「第01巻」「第０１巻」） - 任意位置
        const pattern5 = /第([０-９0-9]+)巻/;
        match = pattern5.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern5, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン6: 数字巻形式（例：「1巻」「１３巻」） - 任意位置
        const pattern6 = /([０-９0-9]+)巻/;
        match = pattern6.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern6, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン7: Vol.数字形式（例：「タイトル Vol.1」） - 末尾限定
        const pattern7 = /[Vv]ol\.?\s*([０-９0-9]+)\s*$/;
        match = pattern7.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern7, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン8: Volume数字形式（例：「タイトル Volume 1」） - 末尾限定
        const pattern8 = /[Vv]olume\s+([０-９0-9]+)\s*$/;
        match = pattern8.exec(cleanTitle);
        if (match) {
            volume = extractNumber(match[1]);
            cleanTitle = cleanTitle.replace(pattern8, '').trim();
            return { title: cleanTitle, volume };
        }
        
        // パターン9: 数字のみの場合（例：「タイトル 1」または「タイトル1」）- 末尾の1～3桁の数字
        const pattern9 = /(\s+|^)([０-９0-9]{1,3})\s*$/;
        match = pattern9.exec(cleanTitle);
        if (match && extractNumber(match[2]) && extractNumber(match[2]) <= 999) {
            volume = extractNumber(match[2]);
            cleanTitle = cleanTitle.replace(pattern9, '').trim();
            return { title: cleanTitle, volume };
        }
        
        return { title: cleanTitle, volume };
    };

    // openBD APIから書籍情報を取得
    const fetchFromOpenBD = async (isbn) => {
        try {
            const response = await $fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            if (response && response[0]) {
                const book = response[0];
                const summary = book.summary || {};
                const onix = book.onix || {};
                const descriptiveDetail = onix.DescriptiveDetail || {};
                const publishingDetail = onix.PublishingDetail || {};
                
                const rawTitle = summary.title || descriptiveDetail.TitleDetail?.TitleElement?.TitleText?.content || '';
                const { title, volume } = extractVolumeFromTitle(rawTitle);
                
                return [{
                    title: title,
                    author: summary.author || descriptiveDetail.Contributor?.[0]?.PersonName?.content || '',
                    publisher: summary.publisher || publishingDetail.Publisher?.[0]?.PublisherName || '',
                    publishedYear: summary.pubdate ? summary.pubdate.substring(0, 4) : '',
                    isbn: summary.isbn || isbn,
                    volume: volume,
                    source: 'openBD'
                }];
            }
        } catch (error) {
            console.warn('openBD APIエラー:', error);
        }
        return [];
    };

    // 国立国会図書館APIから書籍情報を取得（タイトル検索）
    const fetchFromNDL = async (title, maxResults = 5) => {
        try {
            const encodedTitle = encodeURIComponent(title);
            const response = await $fetch(`https://ndlsearch.ndl.go.jp/api/opensearch?title=${encodedTitle}&cnt=${maxResults}`);
            
            // OpenSearch形式のXMLレスポンスをパース
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response, 'text/xml');
            
            const items = xmlDoc.getElementsByTagName('item');
            const results = [];
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const titleEl = item.getElementsByTagName('title')[0];
                const authorEl = item.getElementsByTagName('author')[0];
                const pubDateEl = item.getElementsByTagName('pubDate')[0];
                const dcCreator = item.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'creator')[0];
                const dcPublisher = item.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'publisher')[0];
                
                const rawTitle = titleEl?.textContent || '';
                const { title, volume } = extractVolumeFromTitle(rawTitle);
                
                results.push({
                    title: title,
                    author: authorEl?.textContent || dcCreator?.textContent || '',
                    publisher: dcPublisher?.textContent || '',
                    publishedYear: pubDateEl?.textContent ? pubDateEl.textContent.substring(0, 4) : '',
                    volume: volume,
                    source: '国立国会図書館'
                });
            }
            
            return results;
        } catch (error) {
            console.warn('国立国会図書館APIエラー:', error);
        }
        return [];
    };

    // Google Books APIから書籍情報を取得
    const fetchFromGoogleBooks = async (title, isbn = null, maxResults = 5) => {
        try {
            let query = isbn ? `isbn:${isbn}` : `intitle:${encodeURIComponent(title)}`;
            const response = await $fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`);
            
            if (response.items && response.items.length > 0) {
                return response.items.map(item => {
                    const volumeInfo = item.volumeInfo;
                    const industryIdentifiers = volumeInfo.industryIdentifiers || [];
                    const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
                    const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');
                    
                    const rawTitle = volumeInfo.title || '';
                    const { title, volume } = extractVolumeFromTitle(rawTitle);
                    
                    return {
                        title: title,
                        author: volumeInfo.authors?.join(', ') || '',
                        publisher: volumeInfo.publisher || '',
                        publishedYear: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : '',
                        isbn: isbn || isbn13?.identifier || isbn10?.identifier || '',
                        volume: volume,
                        source: 'Google Books'
                    };
                });
            }
        } catch (error) {
            console.warn('Google Books APIエラー:', error);
        }
        return [];
    };

    // 書籍情報を外部APIや内部CSVから補完
    const enrichBookInfo = async (book) => {
        const missingFields = [];
        if (!book.title) missingFields.push('title');
        if (!book.author) missingFields.push('author');
        if (!book.publisher) missingFields.push('publisher');
        // 必須項目が全て揃っている場合は補完不要
        if (missingFields.length === 0) return book;

        // 0. 内部CSVリストからタイトル一致・著者ありを優先補完
        if (book.title) {
            const localMatch = selectedBooks.value.find(b =>
                b.title === book.title && b.author && b.author.trim() && b.id !== book.id
            );
            if (localMatch) {
                return {
                    ...book,
                    author: localMatch.author,
                    publisher: book.publisher || localMatch.publisher,
                    publishedYear: book.publishedYear || localMatch.publishedYear,
                    isbn: book.isbn || localMatch.isbn,
                    volume: book.volume || localMatch.volume,
                };
            }
        }

        let candidates = [];

        // ISBNがある場合、openBDから取得を試みる
        if (book.isbn) {
            const openBDResults = await fetchFromOpenBD(book.isbn);
            if (openBDResults.length > 0) {
                candidates.push(...openBDResults);
            }
        }

        // ISBNがない、またはopenBDで見つからない場合、タイトルで検索
        if (candidates.length === 0 && book.title) {
            // まずGoogle Booksを試す（レスポンスが安定している）
            const googleResults = await fetchFromGoogleBooks(book.title, book.isbn);
            if (googleResults.length > 0) {
                candidates.push(...googleResults);
            }
            // Google Booksで見つからない場合、国立国会図書館を試す
            if (candidates.length === 0) {
                const ndlResults = await fetchFromNDL(book.title);
                if (ndlResults.length > 0) {
                    candidates.push(...ndlResults);
                }
            }
        }

        // 候補が見つからない場合
        if (candidates.length === 0) {
            return null;
        }

        // 候補が1件のみの場合は自動適用
        if (candidates.length === 1) {
            const enrichedData = candidates[0];
            toast.info(`${enrichedData.source}から「${enrichedData.title}」の情報を取得しました`);
            return {
                ...book,
                title: book.title || enrichedData.title,
                author: book.author || enrichedData.author,
                publisher: book.publisher || enrichedData.publisher,
                publishedYear: book.publishedYear || enrichedData.publishedYear,
                isbn: book.isbn || enrichedData.isbn,
                volume: book.volume || enrichedData.volume,
            };
        }

        // 複数候補がある場合、ユーザーに選択させる
        currentEnrichingBook.value = book;
        enrichmentCandidates.value = candidates;
        showCandidateSelector.value = true;
        // Promise を返して、選択が完了するまで待機。キャンセル時はnullを返す
        return new Promise((resolve) => {
            const checkSelection = setInterval(() => {
                if (!showCandidateSelector.value) {
                    clearInterval(checkSelection);
                    resolve(currentEnrichingBook.value || null);
                }
            }, 100);
        });
    };
    
    // 補完候補を選択して適用
    const selectEnrichmentCandidate = (candidate) => {
        if (!currentEnrichingBook.value) return;
        
        const book = currentEnrichingBook.value;
        const enrichedBook = {
            ...book,
            title: book.title || candidate.title,
            author: book.author || candidate.author,
            publisher: book.publisher || candidate.publisher,
            publishedYear: book.publishedYear || candidate.publishedYear,
            isbn: book.isbn || candidate.isbn,
            volume: book.volume || candidate.volume,
        };
        
        // selectedBooksの該当項目を更新
        const index = selectedBooks.value.findIndex(b => b.id === book.id);
        if (index !== -1) {
            selectedBooks.value[index] = { ...selectedBooks.value[index], ...enrichedBook };
        }
        
        currentEnrichingBook.value = enrichedBook;
        showCandidateSelector.value = false;
        enrichmentCandidates.value = [];
        
        toast.success(`「${candidate.title}」を選択しました（${candidate.source}）`);
    };
    
    // 補完をキャンセル
    const cancelEnrichment = () => {
        showCandidateSelector.value = false;
        enrichmentCandidates.value = [];
        // currentEnrichingBookはそのまま（変更なし）
    };

    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return [];

        // CSVパース（カンマ区切り、ダブルクォート対応）
        const rows = lines.map(line => {
            const cells = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cells.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            cells.push(current.trim());
            
            return cells;
        });

        // ヘッダー行をチェック
        const firstRow = rows[0];
        const headerMapping = detectHeaders(firstRow);
        
        if (headerMapping) {
            // ヘッダーがある場合、データ行のみを返す
            return { rows: rows.slice(1), headerMapping };
        }
        
        // ヘッダーがない場合、全行を返す
        return { rows, headerMapping: null };
    };

    // ヘッダー行から列のマッピングを検出
    const detectHeaders = (headerRow) => {
        const mapping = {};
        let hasValidHeader = false;
        
        headerRow.forEach((header, index) => {
            const normalized = header.toLowerCase().trim();
            
            // タイトル関連
            if (normalized.includes('title') || normalized.includes('タイトル') || 
                normalized.includes('書名') || normalized.includes('書誌名') || normalized.includes('本')) {
                mapping[index] = 'title';
                hasValidHeader = true;
            }
            // 著者関連
            else if (normalized.includes('author') || normalized.includes('著者') || 
                     normalized.includes('作者') || normalized.includes('筆者')) {
                mapping[index] = 'author';
                hasValidHeader = true;
            }
            // ISBN
            else if (normalized.includes('isbn')) {
                mapping[index] = 'isbn';
                hasValidHeader = true;
            }
            // 出版社関連
            else if (normalized.includes('publisher') || normalized.includes('出版社')) {
                mapping[index] = 'publisher';
                hasValidHeader = true;
            }
            // レーベル（出版社として扱う場合もある）
            else if (normalized.includes('レーベル') || normalized.includes('label')) {
                mapping[index] = 'label';
                hasValidHeader = true;
            }
            // 出版年
            else if (normalized.includes('year') || normalized.includes('出版年') || 
                     normalized.includes('刊行年') || normalized.includes('発行年')) {
                mapping[index] = 'year';
                hasValidHeader = true;
            }
            // 購入日（無視するがヘッダーとして認識）
            else if (normalized.includes('購入日') || normalized.includes('日付') || 
                     normalized.includes('date')) {
                mapping[index] = 'ignore';
                hasValidHeader = true;
            }
            // アーカイブ（無視）
            else if (normalized.includes('アーカイブ') || normalized.includes('archive')) {
                mapping[index] = 'ignore';
                hasValidHeader = true;
            }
        });
        
        return hasValidHeader ? mapping : null;
    };

    // ヘッダーマッピングを使用して行をパース
    const parseRowWithHeaders = (row, headerMapping) => {
        const book = {
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            publishedYear: '',
            volume: undefined,
        };
        
        row.forEach((cell, index) => {
            const fieldType = headerMapping[index];
            const value = cell.trim();
            
            if (!value || value === 'なし' || value === '-' || value === '') {
                return;
            }
            
            switch (fieldType) {
                case 'title':
                    book.title = value;
                    break;
                case 'author':
                    book.author = value;
                    break;
                case 'isbn':
                    book.isbn = value.replace(/\D/g, '');
                    break;
                case 'publisher':
                    book.publisher = value;
                    break;
                case 'label':
                    // レーベルは出版社の補足情報として追加
                    book.publisher = book.publisher ? `${book.publisher} (${value})` : value;
                    break;
                case 'year':
                    // 年号を抽出
                    const yearMatch = value.match(/\d{4}/);
                    if (yearMatch) {
                        book.publishedYear = yearMatch[0];
                    }
                    break;
                case 'ignore':
                    // 無視
                    break;
            }
        });
        
        // タイトルから巻数を抽出
        if (book.title) {
            const { title, volume } = extractVolumeFromTitle(book.title);
            book.title = title;
            if (volume !== null) {
                book.volume = volume;
            }
        }
        
        // タイトルからフィルターを抽出
        book.filters = extractFiltersFromTitle(book.title);
        // フィルタータグをタイトルから除去
        book.title = removeFiltersFromTitle(book.title);
        
        return book;
    };

    // セルの内容から種類を推定する
    const detectFieldType = (value) => {
        if (!value || value === 'なし' || value === '-') return null;
        
        // ISBN判定: 数字とハイフンのみ、10桁または13桁
        const isbnPattern = /^[\d\-]{10,17}$/;
        if (isbnPattern.test(value.replace(/-/g, ''))) {
            const digits = value.replace(/\D/g, '');
            if (digits.length === 10 || digits.length === 13) {
                return 'isbn';
            }
        }
        
        // 年号判定: 4桁の数字
        if (/^\d{4}$/.test(value)) {
            const year = parseInt(value);
            if (year >= 1900 && year <= 2100) {
                return 'year';
            }
        }
        
        // 出版社判定: 特定のキーワードを含む
        const publisherKeywords = ['出版', '社', '書店', 'プレス', 'Press', '文庫', '新書', 'KADOKAWA', '講談社', '集英社', '小学館'];
        if (publisherKeywords.some(keyword => value.includes(keyword))) {
            return 'publisher';
        }
        
        // 日付判定: YYYY年MM月DD日形式
        if (/\d{4}年\d{1,2}月\d{1,2}日/.test(value)) {
            return 'date';
        }
        
        return 'text';
    };

    // 行データをスマートに解析してオブジェクトに変換
    const parseRowSmart = (row) => {
        const book = {
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            publishedYear: '',
            volume: undefined,
        };

        const textFields = [];
        
        row.forEach(cell => {
            const type = detectFieldType(cell);
            
            switch (type) {
                case 'isbn':
                    book.isbn = cell.replace(/\D/g, ''); // ハイフンを除去
                    break;
                case 'year':
                    book.publishedYear = cell;
                    break;
                case 'publisher':
                    book.publisher = cell;
                    break;
                case 'date':
                    // 日付は無視（出版日ではなく、データ作成日の可能性）
                    break;
                case 'text':
                    textFields.push(cell);
                    break;
            }
        });

        // 残ったテキストフィールドをタイトルと著者に割り当て
        if (textFields.length > 0) {
            book.title = textFields[0];
            if (textFields.length > 1) {
                book.author = textFields[1];
            }
        }

        // タイトルから巻数を抽出
        if (book.title) {
            const { title, volume } = extractVolumeFromTitle(book.title);
            book.title = title;
            if (volume !== null) {
                book.volume = volume;
            }
        }

        // タイトルからフィルターを抽出
        book.filters = extractFiltersFromTitle(book.title);
        // フィルタータグをタイトルから除去
        book.title = removeFiltersFromTitle(book.title);

        return book;
    };

    // DBに既存かどうかをまとめて確認し、重複を除外
    const filterExistingBooks = async (books: Book[]) => {
        if (!books || books.length === 0) {
            return { filtered: [], removedCount: 0 };
        }

        const volumeKey = (volume: number | null | undefined) => {
            return volume === null || volume === undefined ? 'null' : String(volume);
        };

        try {
            const payload = books.map(book => ({
                isbn: book.isbn || null,
                title: book.title || '',
                volume: book.volume ?? null,
            }));

            const { existingIsbns = [], existingTitleVolumes = [] } = await $fetch('/api/bookCrud/exists', {
                method: 'POST',
                body: { books: payload },
            });

            const isbnSet = new Set((existingIsbns as string[]).filter(Boolean));
            const titleVolumeSet = new Set(
                (existingTitleVolumes as Array<{ title: string; volume: number | null }>).map(tv => `${tv.title}||${volumeKey(tv.volume)}`)
            );

            const filtered = books.filter(book => {
                if (book.isbn && isbnSet.has(book.isbn)) return false;
                const key = `${book.title || ''}||${volumeKey(book.volume)}`;
                return !titleVolumeSet.has(key);
            });

            return { filtered, removedCount: books.length - filtered.length };
        } catch (error) {
            console.warn('Duplicate check failed:', error);
            toast.warning('既存データ確認に失敗したため、重複チェックをスキップしました。');
            return { filtered: books, removedCount: 0 };
        }
    };

    const uploadCSV = async (file, selectedEncoding = null) => {
        if (!file) return;
        
        isLoading.value = true;
        
        const tryEncoding = selectedEncoding || encoding.value;
        
        try {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const text = event.target.result;
                    
                    // 文字化けチェック（�が含まれているか）
                    if (text.includes('�') && tryEncoding === 'UTF-8') {
                        // UTF-8で文字化けした場合、Shift_JISで再試行
                        isLoading.value = false;
                        toast.info('エンコーディングを自動検出中...');
                        setTimeout(() => uploadCSV(file, 'Shift_JIS'), 100);
                        return;
                    }
                    
                    const parsed = parseCSV(text);
                    const { rows, headerMapping } = parsed;
                    
                    const parsedBooks = rows.map((row, index) => {
                        let book;
                        
                        if (headerMapping) {
                            // ヘッダーがある場合、ヘッダーマッピングを使用
                            book = parseRowWithHeaders(row, headerMapping);
                        } else {
                            // ヘッダーがない場合、自動判定を使用
                            book = parseRowSmart(row);
                        }
                        
                        return {
                            id: index,
                            ...book,
                            selected: true,
                        };
                    }).filter(book => book.title || book.isbn);

                    const { filtered, removedCount } = await filterExistingBooks(parsedBooks);
                    selectedBooks.value = filtered;
                    
                    // 利用可能なフィルターを抽出
                    const filterSet = new Set<string>();
                    let hasUntagged = false;
                    selectedBooks.value.forEach(book => {
                        if (book.filters && book.filters.length > 0) {
                            book.filters.forEach(filter => filterSet.add(filter));
                        } else {
                            hasUntagged = true;
                        }
                    });
                    availableFilters.value = Array.from(filterSet).sort();
                    // タグなし書籍がある場合は「タグなし」を追加
                    if (hasUntagged) {
                        availableFilters.value.unshift('タグなし');
                    }
                    selectedFilters.value = [];
                    
                    encoding.value = tryEncoding;
                    isLoading.value = false;
                    const removedNote = removedCount > 0 ? `（${removedCount}冊は既存データのため除外）` : '';
                    toast.success(`${selectedBooks.value.length}冊の書籍情報を読み込みました。(${tryEncoding})${removedNote}`);
                } catch (error) {
                    isLoading.value = false;
                    toast.error('CSVの解析に失敗しました。');
                    console.error(error);
                }
            };
            
            reader.onerror = () => {
                isLoading.value = false;
                toast.error('ファイルの読み込みに失敗しました。');
            };
            
            reader.readAsText(file, tryEncoding);
        } catch (error) {
            isLoading.value = false;
            toast.error('ファイルの処理に失敗しました。');
            console.error(error);
        }
    };

    const registerBooks = async () => {
        let booksToRegister = selectedBooks.value.filter(book => book.selected);
        
        if (booksToRegister.length === 0) {
            toast.warning('登録する書籍を選択してください。');
            return;
        }

        const { filtered: dedupedBooks, removedCount: skippedCount } = await filterExistingBooks(booksToRegister);
        if (skippedCount > 0) {
            toast.info(`${skippedCount}冊は既に登録済みのため除外しました。`);
        }

        if (dedupedBooks.length === 0) {
            toast.info('既存データのみのため、新規登録はありません。');
            // 重複していた選択分をリストから外す
            const dedupIds = new Set(dedupedBooks.map(b => b.id));
            selectedBooks.value = selectedBooks.value.filter(book => !book.selected || dedupIds.has(book.id));
            return;
        }

        const dedupIds = new Set(dedupedBooks.map(b => b.id));
        // 重複として除外されたものをリストから取り除く
        selectedBooks.value = selectedBooks.value.filter(book => !book.selected || dedupIds.has(book.id));
        booksToRegister = dedupedBooks;

        isLoading.value = true;
        
        try {
            let successCount = 0;
            let enrichedCount = 0;
            
            // 選択された書籍のみ登録処理を実行
            for (const book of booksToRegister) {
                let bookToRegister = { ...book };
                
                // 必須項目（title, author, publisher）の不足をチェック
                const hasTitle = !!book.title;
                const hasAuthor = !!book.author;
                const hasPublisher = !!book.publisher;
                
                // いずれかの必須項目が不足している場合、外部APIから補完を試みる
                if (!hasTitle || !hasAuthor || !hasPublisher) {
                    toast.info(`「${book.title || book.isbn || '不明'}」の情報を補完中...`);
                    bookToRegister = await enrichBookInfo(book);
                    
                    // 補完できたかチェック
                    if (bookToRegister.title !== book.title || 
                        bookToRegister.author !== book.author || 
                        bookToRegister.publisher !== book.publisher) {
                        enrichedCount++;
                        // selectedBooksの該当項目も更新
                        const index = selectedBooks.value.findIndex(b => b.id === book.id);
                        if (index !== -1) {
                            selectedBooks.value[index] = { ...selectedBooks.value[index], ...bookToRegister };
                        }
                    }
                }
                
                // タイトルが必須なので、それでも不足している場合や、enrichBookInfoでnullが返った場合はスキップ
                if (!bookToRegister || !bookToRegister.title) {
                    toast.warning(`タイトルが不明、または補完候補が選択されなかった書籍をスキップしました`);
                    continue;
                }
                
                // 著者名を配列形式に変換（カンマ区切りで複数著者に対応）
                const authorNames = bookToRegister.author 
                    ? bookToRegister.author.split(/[,、]/).map(a => a.trim()).filter(a => a)
                    : [];
                
                // 著者名が空の場合はデフォルト値を設定
                if (authorNames.length === 0) {
                    authorNames.push('不明');
                }
                
                // APIエンドポイントに書籍を登録
                await $fetch('/api/bookCrud', {
                    method: 'POST',
                    body: {
                        title: bookToRegister.title,
                        authorNames: authorNames,
                        bookType: 'General', // デフォルト値
                        readStatus: 'Unread', // デフォルト値
                        isbn: bookToRegister.isbn || undefined,
                        publisherName: bookToRegister.publisher || undefined,
                        releaseDate: bookToRegister.publishedYear ? new Date(`${bookToRegister.publishedYear}-01-01`).toISOString() : undefined,
                        volume: bookToRegister.volume || undefined,
                    },
                });
                
                successCount++;
            }
            
            isLoading.value = false;
            
            if (enrichedCount > 0) {
                toast.success(`${successCount}冊の書籍を登録しました（${enrichedCount}冊は外部APIから情報を補完）`);
            } else {
                toast.success(`${successCount}冊の書籍を登録しました`);
            }
            
            // 登録成功した書籍を選択リストから除外
            selectedBooks.value = selectedBooks.value.filter(book => !book.selected);
        } catch (error) {
            isLoading.value = false;
            toast.error('書籍の登録に失敗しました。');
            console.error(error);
        }
    };

    const setEncoding = (enc) => {
        encoding.value = enc;
    };

    // フィルターの選別を切り替え
    const toggleFilter = (filter) => {
        const index = selectedFilters.value.indexOf(filter);
        if (index > -1) {
            selectedFilters.value.splice(index, 1);
        } else {
            selectedFilters.value.push(filter);
        }
    };
    
    // フィルター済み書籍を取得
    const getFilteredBooks = () => {
        if (selectedFilters.value.length === 0) {
            return selectedBooks.value;
        }
        
        return selectedBooks.value.filter(book => {
            // 「タグなし」が選択されている場合
            if (selectedFilters.value.includes('タグなし')) {
                const hasOtherFilters = selectedFilters.value.filter(f => f !== 'タグなし').length > 0;
                
                if (hasOtherFilters) {
                    // 「タグなし」と他のフィルターが混在している場合、どちらかに該当
                    const isUntagged = !book.filters || book.filters.length === 0;
                    const hasSelectedFilter = book.filters && selectedFilters.value.some(filter => 
                        filter !== 'タグなし' && book.filters.includes(filter)
                    );
                    return isUntagged || hasSelectedFilter;
                } else {
                    // 「タグなし」のみが選択されている場合
                    return !book.filters || book.filters.length === 0;
                }
            }
            
            // 他のフィルターのみが選択されている場合
            if (!book.filters || book.filters.length === 0) {
                return false;
            }
            return selectedFilters.value.some(filter => book.filters.includes(filter));
        });
    };

    return { 
        selectedBooks, 
        uploadCSV, 
        registerBooks, 
        isLoading, 
        encoding, 
        setEncoding,
        enrichmentCandidates,
        showCandidateSelector,
        selectEnrichmentCandidate,
        cancelEnrichment,
        availableFilters,
        selectedFilters,
        toggleFilter,
        getFilteredBooks
    };
}