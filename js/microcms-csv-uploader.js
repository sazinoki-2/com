// microCMS CSV アップロード機能
class MicroCMSCSVUploader {
    constructor(config = {}) {
        this.serviceDomain = config.serviceDomain || 'sazinoki5';
        this.apiKey = config.apiKey || null;
        this.baseUrl = `https://${this.serviceDomain}.microcms.io/api/v1`;
        this.uploadStatus = document.getElementById('upload-status');
        this.setupUI();
    }

    // UI セットアップ
    setupUI() {
        this.createUploadInterface();
        this.bindEvents();
    }

    // アップロードインターフェース作成
    createUploadInterface() {
        const uploadDiv = document.createElement('div');
        uploadDiv.className = 'csv-upload-interface';
        uploadDiv.innerHTML = `
            <style>
                .csv-upload-interface {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.9);
                    border: 2px solid #4ecdc4;
                    border-radius: 15px;
                    padding: 20px;
                    color: white;
                    font-family: 'Courier New', monospace;
                    z-index: 2000;
                    min-width: 300px;
                    backdrop-filter: blur(10px);
                    display: none;
                }
                .csv-upload-interface.show {
                    display: block;
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .upload-section {
                    margin-bottom: 15px;
                }
                .upload-section h4 {
                    color: #4ecdc4;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .file-input {
                    width: 100%;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 5px;
                    color: white;
                    font-size: 12px;
                }
                .upload-btn {
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 5px;
                    transition: transform 0.2s;
                }
                .upload-btn:hover {
                    transform: translateY(-1px);
                }
                .upload-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .status-log {
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 5px;
                    padding: 10px;
                    font-size: 11px;
                    max-height: 200px;
                    overflow-y: auto;
                    margin-top: 10px;
                    white-space: pre-wrap;
                    color: #90EE90;
                }
                .api-key-input {
                    width: 100%;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 5px;
                    color: white;
                    font-size: 11px;
                    margin-bottom: 10px;
                }
                .toggle-btn {
                    position: absolute;
                    top: -45px;
                    right: 0;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #4ecdc4;
                    color: #4ecdc4;
                    padding: 5px 10px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: 'Courier New', monospace;
                }
            </style>
            
            <button class="toggle-btn" onclick="csvUploader.toggleInterface()">📤 CSV</button>
            
            <div class="upload-content">
                <h3 style="color: #4ecdc4; margin-bottom: 15px; font-size: 16px;">📤 CSV Upload</h3>
                
                <div class="upload-section">
                    <h4>API設定</h4>
                    <input type="password" class="api-key-input" id="api-key-input" 
                           placeholder="microCMS API Key" value="">
                </div>

                <div class="upload-section">
                    <h4>🎨 Portfolio (リスト型)</h4>
                    <input type="file" class="file-input" id="portoforiohukusuu-csv" accept=".csv">
                    <button class="upload-btn" onclick="csvUploader.uploadCSV('portoforiohukusuu', 'portoforiohukusuu-csv')">Upload Portfolio CSV</button>
                    <small style="color: #4ecdc4; font-size: 10px;">✅ CSVインポート対応</small>
                </div>

                <div class="upload-section">
                    <h4>📄 Other (リスト型)</h4>
                    <input type="file" class="file-input" id="othetr-csv" accept=".csv">
                    <button class="upload-btn" onclick="csvUploader.uploadCSV('othetr', 'othetr-csv')">Upload Other CSV</button>
                    <small style="color: #4ecdc4; font-size: 10px;">✅ CSVインポート対応</small>
                </div>

                <div class="upload-section">
                    <h4>👤 Profile (オブジェクト型)</h4>
                    <button class="upload-btn" onclick="csvUploader.openMicroCMSAdmin('profile')" style="background: #666;">microCMS管理画面で編集</button>
                    <small style="color: #ff9999; font-size: 10px;">❌ CSVインポート非対応</small>
                </div>

                <div class="upload-section">
                    <h4>🌸 DAO Section (オブジェクト型)</h4>
                    <button class="upload-btn" onclick="csvUploader.openMicroCMSAdmin('dao-section')" style="background: #666;">microCMS管理画面で編集</button>
                    <small style="color: #ff9999; font-size: 10px;">❌ CSVインポート非対応</small>
                </div>

                <div class="upload-section">
                    <h4>📧 Contact (オブジェクト型)</h4>
                    <button class="upload-btn" onclick="csvUploader.openMicroCMSAdmin('contact-section')" style="background: #666;">microCMS管理画面で編集</button>
                    <small style="color: #ff9999; font-size: 10px;">❌ CSVインポート非対応</small>
                </div>

                <div class="status-log" id="upload-status">
📝 microCMS CSVアップロード機能
✅ リスト型API: portoforiohukusuu, othetr → CSVアップロード対応
❌ オブジェクト型API: profile, dao-section, contact-section → 管理画面で編集
🔑 APIキー入力後、CSVファイルを選択してアップロード
📋 CSVテンプレートは csv-templates フォルダにあります
                </div>
            </div>
        `;
        
        document.body.appendChild(uploadDiv);
        this.uploadInterface = uploadDiv;
    }

    // イベントバインド
    bindEvents() {
        // APIキー入力の監視
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value;
                this.log(this.apiKey ? '🔑 APIキーが設定されました' : '❌ APIキーが必要です');
            });
        }
    }

    // インターフェース表示/非表示
    toggleInterface() {
        if (this.uploadInterface.classList.contains('show')) {
            this.uploadInterface.classList.remove('show');
        } else {
            this.uploadInterface.classList.add('show');
        }
    }

    // ログ出力
    log(message) {
        if (this.uploadStatus) {
            const timestamp = new Date().toLocaleTimeString();
            this.uploadStatus.textContent += `\\n[${timestamp}] ${message}`;
            this.uploadStatus.scrollTop = this.uploadStatus.scrollHeight;
        }
    }

    // CSV解析
    parseCSV(csvText) {
        const lines = csvText.trim().split('\\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        });
    }

    // CSV行の解析（カンマとクオーテーション対応）
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    // microCMS APIリクエスト
    async makeAPIRequest(endpoint, method, data) {
        if (!this.apiKey) {
            throw new Error('APIキーが設定されていません');
        }

        const url = `${this.baseUrl}/${endpoint}`;
        this.log(`📤 API Request: ${method} ${url}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'X-MICROCMS-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    // CSVアップロード
    async uploadCSV(endpoint, fileInputId) {
        try {
            const fileInput = document.getElementById(fileInputId);
            const file = fileInput.files[0];
            
            if (!file) {
                this.log('❌ ファイルが選択されていません');
                return;
            }

            if (!this.apiKey) {
                this.log('❌ APIキーを入力してください');
                return;
            }

            this.log(`📤 ${file.name} をアップロード中...`);

            const csvText = await this.readFileAsText(file);
            const data = this.parseCSV(csvText);
            
            this.log(`📊 ${data.length}件のデータを解析しました`);

            // リスト型APIのみCSVアップロード対応
            const listTypeEndpoints = ['portoforiohukusuu', 'othetr'];
            
            if (!listTypeEndpoints.includes(endpoint)) {
                this.log(`❌ ${endpoint} はCSVアップロード非対応です。microCMS管理画面で編集してください。`);
                return;
            }

            // リスト形式の場合のみ処理
            for (let i = 0; i < data.length; i++) {
                const result = await this.makeAPIRequest(endpoint, 'POST', data[i]);
                this.log(`✅ ${endpoint} [${i + 1}/${data.length}] をアップロードしました: ${result.id}`);
                
                // API制限対策で少し待機
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            this.log(`🎉 ${endpoint} のアップロードが完了しました！`);
            
            // ページをリロードしてデータを反映
            setTimeout(() => {
                this.log('🔄 ページをリロードしてデータを反映します...');
                window.location.reload();
            }, 2000);

        } catch (error) {
            this.log(`❌ アップロードエラー: ${error.message}`);
            console.error('Upload error:', error);
        }
    }

    // ファイルをテキストとして読み込み
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('ファイル読み込みエラー'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    // microCMS管理画面を開く
    openMicroCMSAdmin(apiType) {
        const url = `https://${this.serviceDomain}.microcms.io/apis/${apiType}`;
        window.open(url, '_blank');
        this.log(`🌐 ${apiType} の管理画面を開きました: ${url}`);
    }

    // CSVテンプレートダウンロード（リスト型のみ）
    downloadTemplate(type) {
        const templates = {
            'stats': '"number","label"\\n"300+","作品数"\\n"50+","クライアント数"\\n"200+","相談実績"\\n"2000万","資本金"',
            'other-items': '"title","description","details"\\n"📝 ブログ","WEB3について発信中","最新記事情報"\\n"🎙️ 音声配信","人生コンサル音声配信","登録者情報"'
        };

        const csvContent = templates[type] || '';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${type}-template.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.log(`📥 ${type} テンプレートをダウンロードしました`);
    }
}

// グローバルインスタンス作成
const csvUploader = new MicroCMSCSVUploader();

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📤 microCMS CSV Uploader が初期化されました');
    console.log('右上の「📤 CSV」ボタンからアップロード機能にアクセスできます');
});