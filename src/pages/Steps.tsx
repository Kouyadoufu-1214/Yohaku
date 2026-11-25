import { useState } from 'react';
import { PageHeader, LinkList, LinkRow, Section, ConfirmDialog } from '../components/ui';
import { Icon } from '../components/Icon';
import { STEP_PLANS, findPlan } from '../data/steps';
import { href } from '../lib/router';
import { NotFound } from './NotFound';

export function Steps() {
  return (
    <div>
      <PageHeader
        title="少しずつ生活に戻る"
        back="/life"
        backLabel="生活支援"
        lead={<p>やりたいことを、小さな段階に分けました。どこから始めても、途中でやめても、やり直しても大丈夫です。</p>}
      />
      <LinkList label="分けてみたいこと">
        {STEP_PLANS.map((p) => (
          <LinkRow key={p.id} to={`/steps/${p.id}`} icon="steps" label={p.label} />
        ))}
      </LinkList>
      <p className="muted small">日数や達成率は記録しません。進み具合はこの画面を開いている間だけ表示され、保存されません。</p>
    </div>
  );
}

type StepState = 'none' | 'done' | 'skipped';

export function StepPlanPage({ id }: { id: string }) {
  const plan = findPlan(id);
  const [states, setStates] = useState<StepState[]>(() => (plan ? plan.steps.map(() => 'none') : []));
  const [confirmReset, setConfirmReset] = useState(false);
  if (!plan) return <NotFound />;

  const setAt = (i: number, s: StepState) => setStates((prev) => prev.map((v, j) => (j === i ? (v === s ? 'none' : s) : v)));
  const current = states.findIndex((s) => s === 'none');

  return (
    <div>
      <PageHeader title={plan.label} back="/steps" backLabel="一覧へ" lead={<p>{plan.intro}</p>} />
      <ol className="step-list">
        {plan.steps.map((step, i) => {
          const st = states[i];
          return (
            <li key={i} className={`step step--${st}${i === current ? ' is-next' : ''}`}>
              <div className="step__head">
                <span className="step__num" aria-hidden="true">
                  {st === 'done' ? <Icon name="check" size={18} /> : i + 1}
                </span>
                <p className="step__text">
                  {step}
                  {st === 'done' && <span className="step__status">（できた）</span>}
                  {st === 'skipped' && <span className="step__status">（今回は飛ばした）</span>}
                </p>
              </div>
              <div className="step__actions">
                <button type="button" className="btn btn--quiet btn--small" aria-pressed={st === 'done'} onClick={() => setAt(i, 'done')}>
                  <span>できた</span>
                </button>
                <button type="button" className="btn btn--quiet btn--small" aria-pressed={st === 'skipped'} onClick={() => setAt(i, 'skipped')}>
                  <span>飛ばす</span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="actions">
        <button type="button" className="btn btn--secondary" onClick={() => setConfirmReset(true)}>
          <Icon name="refresh" size={20} />
          <span>最初からやり直す</span>
        </button>
        <a className="btn btn--quiet" href={href('/steps')}>
          <span>ここでやめる</span>
        </a>
      </div>
      <p className="muted small">やめても、また戻ってきても大丈夫です。順番どおりに進めなくてもかまいません。</p>

      {plan.links && (
        <Section title="使えるもの">
          <LinkList>
            {plan.links.map((l) => (
              <LinkRow key={l.to + l.label} to={l.to} label={l.label} />
            ))}
          </LinkList>
        </Section>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="最初からやり直しますか？"
        confirmLabel="やり直す"
        onConfirm={() => {
          setStates(plan.steps.map(() => 'none'));
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      >
        <p>「できた」「飛ばす」の印をすべて外します。</p>
      </ConfirmDialog>
    </div>
  );
}
