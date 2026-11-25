import { PageHeader, Section, Notice, ExternalLink } from '../components/ui';
import { href } from '../lib/router';

export const APP_VERSION = '0.1.0';
const POLICY_DATE = '2026年11月25日';

export function Privacy() {
  return (
    <div className="doc">
      <PageHeader title="プライバシーポリシー" back="/settings" backLabel="設定" lead={<p className="muted">案・{POLICY_DATE} 制定予定</p>} />
      <Section title="1. 基本的な考え方">
        <p>余白。（以下「本アプリ」）は、利用者の個人情報を集めないことを前提に作られています。会員登録やログインはなく、利用者の入力内容を外部のサーバーへ送ることはありません。</p>
      </Section>
      <Section title="2. 集めない情報">
        <ul className="plain-list">
          <li>氏名、メールアドレス、電話番号などの登録情報（登録の仕組み自体がありません）</li>
          <li>気持ちの記録、書いた文章、作成した連絡文やカードの内容</li>
          <li>アクセス解析・広告・行動追跡のための情報（解析ツール・広告・Cookie を使用していません）</li>
          <li>カメラ、マイク、位置情報、連絡先、通知などの権限（要求しません）</li>
        </ul>
      </Section>
      <Section title="3. 端末の中に保存される情報">
        <p>次の情報は、利用者の端末（ブラウザ）の中にだけ保存されます。運営者が見ることはできません。</p>
        <ul className="plain-list">
          <li>表示の設定（表示モード、テーマ、文字の大きさ、音量など）：ブラウザの localStorage に保存します。設定で「記憶しない」を選ぶこともできます。</li>
          <li>気持ちの記録・置いていったことば：利用者が「この端末に保存する」を選んだときだけ、ブラウザの IndexedDB に保存します。初期設定では保存しません。</li>
          <li>オフラインで使うためのアプリ本体のファイル：ブラウザの Cache Storage に保存します。利用者の入力内容は含みません。</li>
        </ul>
        <p>保存された内容は暗号化されていません。家族などと共有している端末では、ほかの人に見られる可能性があります。</p>
      </Section>
      <Section title="4. 削除のしかた">
        <p>
          <a href={href('/settings')}>設定</a>の「この端末のデータをすべて削除する」で、記録と設定を削除できます。記録は一件ずつ削除することもできます。ブラウザの設定からサイトのデータを削除する方法でも、すべて消すことができます。
        </p>
      </Section>
      <Section title="5. 外部のサイトや電話">
        <p>相談窓口などのリンク先は、それぞれの運営者が管理しています。リンク先での情報の扱いは、各運営者のプライバシーポリシーに従います。本アプリからリンク先へ、参照元の情報（どのページから来たか）は送らない設定にしています。</p>
      </Section>
      <Section title="6. 公開しているサーバー（ホスティング）について">
        <p>本アプリは静的なWebサイトとして公開されます。公開に使うホスティング事業者が、セキュリティなどの目的で、アクセス元のIPアドレスなどの通信記録を保存する場合があります。たとえば GitHub Pages は、サイトの訪問者のIPアドレスをセキュリティ目的で記録・保存すると公式ドキュメントで説明しています。</p>
        <p>運営者は、これらの通信記録を利用者の分析や追跡のために使いません。利用者の入力内容は、そもそも通信に含まれません。</p>
      </Section>
      <Section title="7. 改定">
        <p>内容を変えるときは、本アプリの中でお知らせします。</p>
      </Section>
      <Section title="8. お問い合わせ">
        <p>（公開時に運営者の連絡先を記載します）</p>
      </Section>
    </div>
  );
}

export function Terms() {
  return (
    <div className="doc">
      <PageHeader title="利用規約" back="/settings" backLabel="設定" lead={<p className="muted">案・{POLICY_DATE} 制定予定</p>} />
      <Section title="1. 本アプリについて">
        <p>余白。（以下「本アプリ」）は、心がつらいときの日常生活を支えることを目的とした、社会貢献のための無料のアプリです。</p>
      </Section>
      <Section title="2. 料金">
        <p>すべての機能を無料で利用できます。広告、アプリ内課金、サブスクリプションはありません。</p>
      </Section>
      <Section title="3. 医療ではないこと">
        <p>本アプリは、医療行為、診断、治療、カウンセリングの代わりにはなりません。体調や心の状態について心配なことがあるときは、医療機関や専門の相談窓口に相談してください。</p>
      </Section>
      <Section title="4. 緊急時">
        <p>命や体に危険が迫っているときは、119番などの緊急の連絡先を利用してください。運営者は利用者の記録を見ることができないため、緊急時に対応することはできません。</p>
      </Section>
      <Section title="5. 利用者の情報">
        <p>
          入力内容の扱いは、<a href={href('/privacy')}>プライバシーポリシー</a>のとおりです。端末に保存したデータの管理（バックアップや削除）は、利用者ご自身で行ってください。
        </p>
      </Section>
      <Section title="6. 掲載している情報">
        <p>運営者は、掲載する情報が正確であるよう努めますが、その完全性を保証するものではありません。相談窓口の受付時間などは変わることがあるため、各公式サイトもご確認ください。</p>
        <p>「誰かの経験を知る」に掲載している文章は、現在すべて開発用の架空のサンプルです。</p>
      </Section>
      <Section title="7. してはいけないこと">
        <ul className="plain-list">
          <li>本アプリを改変して、利用者をだましたり、個人情報を集めたりすること</li>
          <li>本アプリの名前をかたって、第三者に害を与えること</li>
        </ul>
      </Section>
      <Section title="8. 変更・終了">
        <p>運営者は、本アプリの内容を変更したり、提供を終了したりすることがあります。その場合は、できるだけ事前にお知らせします。</p>
      </Section>
      <Section title="9. 責任の範囲">
        <p>運営者の故意または重大な過失による場合を除き、本アプリの利用によって生じた損害について責任を負いません。端末内のデータは、ブラウザの設定や端末の状態によって消えることがあります。</p>
      </Section>
      <Section title="10. 準拠法">
        <p>この規約は日本の法律に従って解釈されます。</p>
      </Section>
    </div>
  );
}

export function About() {
  return (
    <div className="doc">
      <PageHeader title="余白。について" back="/settings" backLabel="設定" lead={<p className="about-catch">何者にもならなくていい時間。</p>} />
      <Section title="大切にしていること">
        <ul className="plain-list">
          <li>心を治すのではなく、心がつらいときの生活を支えます。</li>
          <li>元気になることを強制しません。</li>
          <li>相談できない人にも、支援を届けたいと考えています。</li>
          <li>他人と比べる必要のない居場所でありたいと思っています。</li>
          <li>何もしなくても、利用できます。</li>
          <li>あなたの意思と選択を尊重します。</li>
          <li>このアプリを使わなくなる日が来たら、それもよいことだと考えています。</li>
        </ul>
      </Section>
      <Section title="運営の方針">
        <ul className="plain-list">
          <li>すべての機能が無料です。広告・課金・サブスクリプションはありません。</li>
          <li>会員登録やログインは必要ありません。</li>
          <li>入力内容を外部に送りません。アクセス解析や行動追跡もしません。</li>
          <li>通知でアプリを開くよう促したり、連続利用の記録をつけたりしません。</li>
          <li>有料のAPIや外部のAIを使っていません。</li>
        </ul>
      </Section>
      <Section title="内容の確認について">
        <Notice>
          <p>このアプリの支援に関する文章は、心理・医療の専門家による確認をまだ受けていません。一般公開の前に、専門家による内容の確認と、利用者による使いやすさの確認を行う予定です。</p>
        </Notice>
      </Section>
      <Section title="ホーム画面に追加する">
        <ul className="plain-list">
          <li>iPhone・iPad（Safari）：共有ボタン → 「ホーム画面に追加」</li>
          <li>Android（Chrome）：メニュー（︙） → 「ホーム画面に追加」または「アプリをインストール」</li>
          <li>パソコン（Chrome・Edge）：アドレスバーのインストールボタン、またはメニューから「アプリをインストール」</li>
        </ul>
        <p className="muted small">一度開くと、インターネットにつながっていなくても基本の機能を使えます。相談窓口のWebサイトを開くには接続が必要です。</p>
      </Section>
      <Section title="素材とライセンス">
        <ul className="plain-list">
          <li>イラスト・アイコン：このアプリのために作成したもの（外部素材は使用していません）</li>
          <li>環境音：端末の中でその場で合成しています（音声ファイルは使用していません）</li>
          <li>文字：端末に入っているフォントを使用しています（外部フォントは読み込みません）</li>
          <li>
            使用しているプログラム：<ExternalLink url="https://react.dev/">React</ExternalLink>（MIT License）
          </li>
        </ul>
      </Section>
      <p className="muted small">バージョン {APP_VERSION}</p>
    </div>
  );
}
