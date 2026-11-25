/**
 * 連絡文作成のテンプレート。外部AIは使わず、テンプレートと条件分岐だけで文章を作る。
 * 病名や詳しい事情を書くことは求めない（理由は「書かない」も選べる）。
 */

export type MessageType =
  | 'school'
  | 'university'
  | 'parttime'
  | 'work'
  | 'decline'
  | 'postpone'
  | 'hospital'
  | 'consult';

export type Politeness = 'formal' | 'polite' | 'casual';
export type Length = 'short' | 'normal' | 'long';
export type Reason = 'health' | 'mind' | 'circumstance' | 'none';
export type When = 'today' | 'tomorrow' | 'custom';

export interface MessageOptions {
  type: MessageType;
  politeness: Politeness;
  length: Length;
  reason: Reason;
  when: When;
  customDate: string;
  recipient: string;
  sender: string;
  /** 学校：連絡する人 */
  relation: 'self' | 'guardian';
  studentName: string;
  /** 学校：学年・クラス / 大学：授業名 */
  className: string;
  studentId: string;
  shift: string;
  duration: 'day' | 'days' | 'undecided';
  handover: boolean;
  event: string;
  futureWish: 'again' | 'none';
  proposal: 'later' | 'none';
  hospitalPurpose: 'first' | 'change' | 'question';
  format: 'text' | 'phone';
  wish: 'listen' | 'together' | 'hospital' | 'know' | 'noreply';
}

export interface GeneratedMessage {
  subject?: string;
  body: string;
}

export interface MessageTypeInfo {
  id: MessageType;
  label: string;
  description: string;
  defaultPoliteness: Politeness;
  usesReason: boolean;
  usesWhen: boolean;
  hasSubject: boolean;
}

export const MESSAGE_TYPES: MessageTypeInfo[] = [
  { id: 'school', label: '学校の欠席連絡', description: '小学校・中学校・高校などへ', defaultPoliteness: 'formal', usesReason: true, usesWhen: true, hasSubject: false },
  { id: 'university', label: '大学の授業の欠席連絡', description: '先生へのメールなど', defaultPoliteness: 'formal', usesReason: true, usesWhen: true, hasSubject: true },
  { id: 'parttime', label: 'アルバイトの欠勤連絡', description: '店長や責任者へ', defaultPoliteness: 'polite', usesReason: true, usesWhen: true, hasSubject: false },
  { id: 'work', label: '職場への休暇連絡', description: '上司や担当者へ', defaultPoliteness: 'formal', usesReason: true, usesWhen: true, hasSubject: true },
  { id: 'decline', label: '誘いを断る連絡', description: '友人・知人などへ', defaultPoliteness: 'casual', usesReason: true, usesWhen: false, hasSubject: false },
  { id: 'postpone', label: '予定を延期する連絡', description: '約束や予定を先にのばす', defaultPoliteness: 'casual', usesReason: true, usesWhen: false, hasSubject: false },
  { id: 'hospital', label: '病院への問い合わせ', description: '予約や受診の相談', defaultPoliteness: 'polite', usesReason: false, usesWhen: true, hasSubject: true },
  { id: 'consult', label: '家族や友人への相談', description: 'しんどいことを伝える', defaultPoliteness: 'casual', usesReason: false, usesWhen: false, hasSubject: false },
];

export function typeInfo(type: MessageType): MessageTypeInfo {
  return MESSAGE_TYPES.find((t) => t.id === type) ?? MESSAGE_TYPES[0];
}

export function defaultOptions(type: MessageType): MessageOptions {
  return {
    type,
    politeness: typeInfo(type).defaultPoliteness,
    length: 'normal',
    reason: 'health',
    when: 'today',
    customDate: '',
    recipient: '',
    sender: '',
    relation: 'self',
    studentName: '',
    className: '',
    studentId: '',
    shift: '',
    duration: 'day',
    handover: false,
    event: '',
    futureWish: 'again',
    proposal: 'later',
    hospitalPurpose: 'first',
    format: 'text',
    wish: 'listen',
  };
}

export const REASON_LABELS: Record<Reason, string> = {
  health: '体調不良（詳しくは書かない）',
  mind: '心身の不調',
  circumstance: 'やむを得ない事情',
  none: '理由は書かない',
};

const P = '○○';

function clean(s: string): string {
  return s.trim().replace(/[\r\n]+/g, ' ');
}

function whenText(o: MessageOptions): string {
  const casual = o.politeness === 'casual';
  if (o.when === 'custom') return clean(o.customDate) || (casual ? '今日' : '本日');
  if (o.when === 'tomorrow') return '明日';
  return casual ? '今日' : '本日';
}

/** 理由の言い方（文のつなぎ「〜のため、」まで含む）。none の場合は空文字 */
function reasonText(o: MessageOptions): string {
  const casual = o.politeness === 'casual';
  switch (o.reason) {
    case 'health':
      return casual ? '体調がよくなくて、' : '体調不良のため、';
    case 'mind':
      return casual ? '心と体の調子がよくなくて、' : '心身の不調のため、';
    case 'circumstance':
      return casual ? 'ちょっと事情があって、' : 'やむを得ない事情により、';
    case 'none':
    default:
      return '';
  }
}

function lines(...parts: (string | false | null | undefined)[]): string {
  const out: string[] = [];
  for (const p of parts) {
    if (p === false || p === null || p === undefined) continue;
    if (p === '' && (out.length === 0 || out[out.length - 1] === '')) continue;
    out.push(p);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

function senderName(o: MessageOptions): string {
  return clean(o.sender) || P;
}

function school(o: MessageOptions): GeneratedMessage {
  const when = whenText(o);
  const reason = reasonText(o);
  const teacher = clean(o.recipient) || `${P}先生`;
  const klass = clean(o.className);
  const name = senderName(o);
  const student = clean(o.studentName) || P;
  const guardian = o.relation === 'guardian';
  const formal = o.politeness === 'formal';
  const short = o.length === 'short';
  const long = o.length === 'long';

  if (short) {
    const who = guardian ? `${klass ? `${klass}の` : ''}${student}の保護者です。` : `${klass ? `${klass}の` : ''}${name}です。`;
    const act = guardian ? `${student}は${when}、${reason}欠席します。` : `${when}は、${reason}欠席します。`;
    return { body: lines(`${teacher}`, `${who}${act}よろしくお願いいたします。`) };
  }

  const intro = guardian
    ? `${klass ? `${klass}、` : ''}${student}の保護者の${name}です。`
    : `${klass ? `${klass}の` : ''}${name}です。`;
  const act = guardian
    ? `${student}は${when}、${reason}欠席${formal ? 'させていただきます' : 'します'}。`
    : `${when}は、${reason}欠席${formal ? 'させていただきます' : 'します'}。`;
  return {
    body: lines(
      teacher,
      '',
      formal ? 'いつもお世話になっております。' : 'お世話になっています。',
      intro,
      act,
      long && (formal ? 'ご迷惑をおかけし、申し訳ありません。' : 'ご迷惑をおかけしてすみません。'),
      long && (guardian ? '連絡事項などがありましたら、お知らせいただけますと助かります。' : '連絡事項などがあれば、教えていただけると助かります。'),
      '',
      formal ? 'どうぞよろしくお願いいたします。' : 'よろしくお願いします。',
      guardian ? `${name}` : false,
    ),
  };
}

function university(o: MessageOptions): GeneratedMessage {
  const when = whenText(o);
  const reason = reasonText(o);
  const teacher = clean(o.recipient) || `${P}先生`;
  const course = clean(o.className) || P;
  const name = senderName(o);
  const id = clean(o.studentId);
  const formal = o.politeness === 'formal';
  const subject = `${course}の欠席について（${name}${id ? ` ${id}` : ''}）`;
  const who = `${course}を履修している${name}${id ? `（学籍番号：${id}）` : ''}です。`;

  if (o.length === 'short') {
    return {
      subject,
      body: lines(teacher, '', who, `${when}の授業を、${reason}欠席いたします。`, 'よろしくお願いいたします。', '', name),
    };
  }
  return {
    subject,
    body: lines(
      teacher,
      '',
      formal ? 'お世話になっております。' : 'お世話になっています。',
      who,
      `${when}の授業を、${reason}欠席${formal ? 'させていただきます' : 'いたします'}。`,
      o.length === 'long' &&
        (formal
          ? '授業の資料や課題について、確認できる方法がありましたら、ご教示いただけますと幸いです。'
          : '授業の資料や課題について、確認する方法があれば教えていただけると助かります。'),
      '',
      formal ? 'お忙しいところ恐れ入りますが、どうぞよろしくお願いいたします。' : 'よろしくお願いいたします。',
      '',
      name,
    ),
  };
}

function parttime(o: MessageOptions): GeneratedMessage {
  const when = whenText(o);
  const reason = reasonText(o);
  const boss = clean(o.recipient);
  const name = senderName(o);
  const shift = clean(o.shift);
  const casual = o.politeness === 'casual';
  const formal = o.politeness === 'formal';
  const shiftText = `${when}${shift ? `（${shift}）` : ''}のシフト`;

  if (o.length === 'short') {
    return {
      body: lines(
        boss && `${boss}`,
        `お疲れさまです。${name}です。`,
        `${shiftText}ですが、${reason}お休みさせてください。${casual ? 'すみません。' : '申し訳ありません。'}`,
      ),
    };
  }
  return {
    body: lines(
      boss && `${boss}`,
      `お疲れさまです。${name}です。`,
      `${shiftText}ですが、${reason}お休みをいただけないでしょうか。`,
      o.length === 'long' && (formal ? '急なご連絡となり、大変申し訳ありません。' : '急な連絡になってしまい、申し訳ありません。'),
      '',
      formal ? 'どうぞよろしくお願いいたします。' : 'よろしくお願いします。',
    ),
  };
}

function work(o: MessageOptions): GeneratedMessage {
  const when = whenText(o);
  const reason = reasonText(o);
  const boss = clean(o.recipient) || `${P}さん`;
  const name = senderName(o);
  const formal = o.politeness === 'formal';
  const subject = `${when}の休暇について（${name}）`;
  const durationLine =
    o.duration === 'days'
      ? formal
        ? 'しばらくの間お休みをいただくことになるかもしれず、改めてご相談させてください。'
        : 'しばらく休むことになるかもしれないので、改めて相談させてください。'
      : o.duration === 'undecided'
        ? formal
          ? '復帰の時期については、改めてご連絡いたします。'
          : '戻れる時期は、改めて連絡します。'
        : false;
  const askLine = formal
    ? `${reason}${when}はお休みをいただきたく、ご連絡いたしました。`
    : `${reason}${when}は休ませてください。`;

  if (o.length === 'short') {
    return { subject, body: lines(boss, `お疲れさまです。${name}です。`, askLine, durationLine, 'よろしくお願いいたします。') };
  }
  return {
    subject,
    body: lines(
      boss,
      '',
      `お疲れさまです。${name}です。`,
      askLine,
      durationLine,
      o.handover &&
        (formal ? '急ぎの業務がありましたら、可能な範囲で共有いたします。' : '急ぎの仕事があれば、できる範囲で共有します。'),
      o.length === 'long' && (formal ? '急なご連絡となり、申し訳ありません。' : '急な連絡ですみません。'),
      '',
      formal ? 'どうぞよろしくお願いいたします。' : 'よろしくお願いします。',
      '',
      name,
    ),
  };
}

function decline(o: MessageOptions): GeneratedMessage {
  const ev = clean(o.event);
  const reason = reasonText(o);
  const again = o.futureWish === 'again';
  const to = clean(o.recipient);
  if (o.politeness === 'casual') {
    return {
      body: lines(
        to && `${to}へ`,
        `誘ってくれてありがとう。${ev ? `${ev}、` : ''}${reason}今回は行けそうにないんだ。ごめんね。`,
        o.length !== 'short' && again && 'また声をかけてもらえたら、うれしいです。',
        o.length === 'long' && 'うまく説明できないけど、あなたのことが嫌なわけじゃないよ。',
      ),
    };
  }
  const formal = o.politeness === 'formal';
  return {
    body: lines(
      to && `${to}`,
      formal ? 'お誘いいただき、誠にありがとうございます。' : 'お誘いいただき、ありがとうございます。',
      `${ev ? `${ev}ですが、` : ''}${reason}今回は${formal ? '参加を見送らせていただきます' : '参加を見送らせてください'}。`,
      o.length !== 'short' && (formal ? 'せっかくお声がけいただいたのに、申し訳ありません。' : '申し訳ありません。'),
      o.length !== 'short' && again && (formal ? 'また機会がありましたら、ぜひよろしくお願いいたします。' : 'また機会があれば、よろしくお願いします。'),
      o.length === 'long' && (formal ? '取り急ぎ、ご連絡まで失礼いたします。' : '取り急ぎご連絡まで。'),
    ),
  };
}

function postpone(o: MessageOptions): GeneratedMessage {
  const ev = clean(o.event) || (o.politeness === 'casual' ? '約束' : 'お約束');
  const reason = reasonText(o);
  const later = o.proposal === 'later';
  const to = clean(o.recipient);
  if (o.politeness === 'casual') {
    return {
      body: lines(
        to && `${to}へ`,
        `${ev}のことなんだけど、${reason}延期してもらえないかな。ごめんね。`,
        o.length !== 'short' && later && '落ち着いたら、こちらからまた連絡するね。',
        o.length === 'long' && '楽しみにしてくれていたら、本当にごめんなさい。',
      ),
    };
  }
  const formal = o.politeness === 'formal';
  return {
    body: lines(
      to && `${to}`,
      formal
        ? `${ev}の件につきまして、誠に恐縮ですが、${reason}延期をお願いできませんでしょうか。`
        : `${ev}の件ですが、${reason}延期していただけないでしょうか。`,
      o.length !== 'short' && later && (formal ? '改めて日程をご相談させていただけますと幸いです。' : '改めて日程を相談させてください。'),
      o.length === 'long' && (formal ? 'ご迷惑をおかけし、大変申し訳ありません。' : 'ご迷惑をおかけしてすみません。'),
      o.length !== 'short' && (formal ? 'どうぞよろしくお願いいたします。' : 'よろしくお願いします。'),
    ),
  };
}

function hospital(o: MessageOptions): GeneratedMessage {
  const name = senderName(o);
  const when = whenText(o);
  const formal = o.politeness === 'formal';
  const subjectMap = { first: '初診の予約について', change: '予約の変更について', question: '受診についての問い合わせ' } as const;

  if (o.format === 'phone') {
    const ask = {
      first: '「初めて受診したいのですが、予約はできますか。」',
      change: `「${when}に予約している${name}です。予約を変更したいのですが、よろしいでしょうか。」`,
      question: '「受診を考えているのですが、どのような流れになるか教えていただけますか。」',
    }[o.hospitalPurpose];
    return {
      body: lines(
        '【電話で話すときのメモ】',
        '',
        `1. 「お忙しいところすみません。${name}と申します。」`,
        `2. ${ask}`,
        '3. 聞かれることがある内容（答えられる範囲で大丈夫です）',
        '　・名前、生年月日、連絡先',
        '　・保険証（マイナ保険証など）があるか',
        '　・困っていること（くわしく話せなくてもかまいません）',
        '4. 言葉につまったら：「うまく話せなくてすみません。少し待っていただけますか。」',
        '5. 最後に：「ありがとうございました。」',
        '',
        '【メモ欄】',
        '予約日時：',
        '持ち物：',
        '',
      ),
    };
  }

  const body = {
    first: formal
      ? '初めて受診させていただきたく、ご連絡いたしました。予約は必要でしょうか。必要な場合は、予約可能な日時を教えていただけますと幸いです。'
      : '初めて受診したいと考えています。予約は必要でしょうか。予約できる日時があれば教えてください。',
    change: formal
      ? `${when}に予約をしております${name}です。誠に恐れ入りますが、予約の日時を変更させていただきたく、ご連絡いたしました。`
      : `${when}に予約している${name}です。予約の日時を変更したく、ご連絡しました。`,
    question: formal
      ? '受診を検討しており、受診までの流れや予約の方法について教えていただけますと幸いです。'
      : '受診を考えています。受診までの流れや予約の方法を教えていただけますか。',
  }[o.hospitalPurpose];

  return {
    subject: subjectMap[o.hospitalPurpose],
    body: lines(
      formal ? 'ご担当者様' : 'ご担当の方へ',
      '',
      o.hospitalPurpose !== 'change' && `${name}と申します。`,
      body,
      o.length !== 'short' && (formal ? '電話でのやりとりが難しいため、メール（またはこのフォーム）でご返信いただけますと助かります。' : '電話で話すのが難しいので、できればメールなどで返信をいただけると助かります。'),
      o.length === 'long' && (formal ? '状況については、受診の際に話せる範囲でお伝えできればと思います。' : '詳しいことは、受診のときに話せる範囲でお伝えします。'),
      '',
      formal ? 'お手数をおかけしますが、どうぞよろしくお願いいたします。' : 'よろしくお願いいたします。',
      '',
      name,
    ),
  };
}

function consult(o: MessageOptions): GeneratedMessage {
  const to = clean(o.recipient);
  const casual = o.politeness === 'casual';
  const wishCasual = {
    listen: '少しだけ、話を聞いてもらえるとうれしい。アドバイスはなくても大丈夫。',
    together: '少しのあいだ、そばにいてもらえると助かる。',
    hospital: '病院に行くか迷っていて、一緒に考えたり、付き添ってもらえたりするとうれしい。',
    know: '知っておいてほしくて連絡しました。何かしてほしいわけじゃないから、大丈夫。',
    noreply: '知っておいてもらえるだけでいいので、返事はいらないよ。',
  }[o.wish];
  const wishPolite = {
    listen: '少しだけ、話を聞いてもらえるとうれしいです。アドバイスはなくても大丈夫です。',
    together: '少しのあいだ、そばにいてもらえると助かります。',
    hospital: '病院に行くか迷っていて、一緒に考えたり、付き添ってもらえたりするとうれしいです。',
    know: '知っておいてほしくて連絡しました。何かしてほしいというわけではありません。',
    noreply: '知っておいてもらえるだけでいいので、返事はなくても大丈夫です。',
  }[o.wish];

  if (o.length === 'short') {
    return {
      body: lines(
        to && `${to}へ`,
        casual ? `最近ちょっとしんどくて。${wishCasual}` : `最近、少ししんどい日が続いています。${wishPolite}`,
      ),
    };
  }
  return {
    body: lines(
      to && `${to}へ`,
      '',
      casual ? '急にごめんね。' : '急にすみません。',
      casual
        ? '最近、しんどい日が続いていて。うまく説明できないんだけど、'
        : '最近、しんどい日が続いています。うまく説明できないのですが、',
      casual ? wishCasual : wishPolite,
      o.length === 'long' && o.wish !== 'noreply' && (casual ? '返事は、すぐじゃなくて大丈夫。' : '返事は、すぐでなくても大丈夫です。'),
      o.length === 'long' && (casual ? '読んでくれてありがとう。' : '読んでくれて、ありがとうございます。'),
    ),
  };
}

export function generateMessage(o: MessageOptions): GeneratedMessage {
  switch (o.type) {
    case 'school':
      return school(o);
    case 'university':
      return university(o);
    case 'parttime':
      return parttime(o);
    case 'work':
      return work(o);
    case 'decline':
      return decline(o);
    case 'postpone':
      return postpone(o);
    case 'hospital':
      return hospital(o);
    case 'consult':
      return consult(o);
  }
}

/** コピー・共有用に件名と本文を1つの文章にまとめる */
export function messageToText(m: GeneratedMessage, subject: string, body: string): string {
  return m.subject !== undefined && subject.trim() ? `件名：${subject.trim()}\n\n${body}` : body;
}
