import { PageHeader, ButtonLink } from '../components/ui';

export function NotFound() {
  return (
    <div>
      <PageHeader title="ページが見つかりませんでした" lead={<p>リンクが古いか、まちがっているのかもしれません。</p>} />
      <div className="actions">
        <ButtonLink to="/" icon="home" variant="primary">
          ホームへ
        </ButtonLink>
        <ButtonLink to="/help" icon="help">
          相談窓口
        </ButtonLink>
      </div>
    </div>
  );
}
