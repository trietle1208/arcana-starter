import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardTile } from './CardTile/CardTile';
import { Divider } from './Divider/Divider';
import { MeaningPanel } from './MeaningPanel/MeaningPanel';
import { SegmentedControl } from './SegmentedControl/SegmentedControl';
import { Tag } from './Tag/Tag';
import { TarotCard } from './TarotCard/TarotCard';
import { TextField } from './TextField/TextField';

// Markup only: these check the roles, names and states a reader relies on. Behaviour in the
// browser (turning, sorting, the URL) is covered by the Playwright flows.
const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('TarotCard', () => {
  it('shows the art with the card name as its alt text', () => {
    const markup = html(<TarotCard src="/cards/09-the-hermit.webp" name="The Hermit" />);
    expect(markup).toContain('alt="The Hermit"');
    expect(markup).not.toContain('role="img"');
  });

  it('says "reversed" in the alt text and under the name, never by rotation alone', () => {
    const markup = html(
      <TarotCard src="/cards/09-the-hermit.webp" name="The Hermit" reversed showName />,
    );
    expect(markup).toContain('alt="The Hermit (reversed)"');
    expect(markup).toContain('Reversed');
  });

  it('labels a face-down card, as a button when it can be turned', () => {
    const still = html(<TarotCard src="/cards/09-the-hermit.webp" name="The Hermit" faceDown />);
    expect(still).toContain('role="img"');
    expect(still).toContain('aria-label="Face-down card — select to reveal"');
    expect(still).toContain('alt=""');

    const button = html(
      <TarotCard src="/cards/09-the-hermit.webp" name="The Hermit" faceDown onClick={() => {}} />,
    );
    expect(button.startsWith('<button')).toBe(true);
    expect(button).toContain('aria-label="Face-down card — select to reveal"');
  });

  it('takes its words from the labels it is given', () => {
    const markup = html(
      <TarotCard
        name="Ẩn Sĩ"
        faceDown
        onClick={() => {}}
        labels={{ faceDown: 'Lá bài úp — chọn để lật' }}
      />,
    );
    expect(markup).toContain('aria-label="Lá bài úp — chọn để lật"');
  });

  it('shows a quiet placeholder with the numeral when there is no image', () => {
    const markup = html(<TarotCard name="The Hermit" numeral="IX" />);
    expect(markup).toContain('<b>IX</b>');
    expect(markup).toContain('The Hermit');
    expect(markup).not.toContain('<img');
  });
});

describe('CardTile', () => {
  it('is one link to the card, with its meta line, name and at most two keywords', () => {
    const markup = html(
      <CardTile
        href="/library/the-hermit"
        src="/cards/09-the-hermit.webp"
        name="The Hermit"
        meta="Major · IX"
        keywords={['Solitude', 'Inner guidance', 'Patience']}
      />,
    );
    expect(markup.startsWith('<a')).toBe(true);
    expect(markup).toContain('href="/library/the-hermit"');
    expect(markup).toContain('Major · IX');
    expect(markup).toContain('Solitude');
    expect(markup).toContain('Inner guidance');
    expect(markup).not.toContain('Patience');
  });
});

describe('Tag', () => {
  it('is a plain label by default, with a tone when asked', () => {
    expect(html(<Tag>Solitude</Tag>)).toMatch(/^<span/);
    expect(html(<Tag tone="olive">Learned</Tag>)).toMatch(/^<span/);
  });

  it('becomes a pressable chip, with a check when selected', () => {
    const off = html(
      <Tag selected={false} onClick={() => {}}>
        Cups
      </Tag>,
    );
    expect(off).toMatch(/^<button/);
    expect(off).toContain('aria-pressed="false"');
    expect(off).not.toContain('<svg');

    const on = html(
      <Tag selected onClick={() => {}}>
        Cups
      </Tag>,
    );
    expect(on).toContain('aria-pressed="true"');
    expect(on).toContain('<svg');
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'upright', label: 'Upright' },
    { value: 'reversed', label: 'Reversed' },
  ];

  it('is a labelled radiogroup with one checked segment in the tab order', () => {
    const markup = html(
      <SegmentedControl label="Orientation" options={options} value="reversed" />,
    );
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Orientation"');
    expect(markup.match(/role="radio"/g)).toHaveLength(2);
    expect(markup).toMatch(/aria-checked="false"[^>]*tabindex="-1"[^>]*>Upright/);
    expect(markup).toMatch(/aria-checked="true"[^>]*tabindex="0"[^>]*>Reversed/);
  });

  it('starts on its first option when nothing is chosen', () => {
    expect(html(<SegmentedControl label="Orientation" options={options} />)).toMatch(
      /aria-checked="true"[^>]*>Upright/,
    );
  });
});

describe('TextField', () => {
  it('ties the label and the hint to the field', () => {
    const markup = html(<TextField label="Your notes" hint="A few lines is plenty." multiline />);
    const id = /<label for="([^"]+)"/.exec(markup)?.[1];
    expect(id).toBeTruthy();
    expect(markup).toContain(`<textarea`);
    expect(markup).toContain(`id="${id}"`);
    expect(markup).toContain(`aria-describedby="${id}-hint"`);
    expect(markup).toContain('rows="5"');
  });

  it('is a single-line input by default, without a hint', () => {
    const markup = html(<TextField label="Search cards" placeholder="Name or keyword" />);
    expect(markup).toContain('<input');
    expect(markup).not.toContain('aria-describedby');
  });
});

describe('MeaningPanel', () => {
  it('shows keywords, then Upright, Reversed and Symbolism', () => {
    const markup = html(
      <MeaningPanel
        keywords={['Solitude']}
        upright="Time alone."
        reversed="Isolation."
        symbolism="A lantern."
      />,
    );
    expect(markup.indexOf('Solitude')).toBeLessThan(markup.indexOf('Upright'));
    expect(markup.indexOf('Upright')).toBeLessThan(markup.indexOf('Reversed'));
    expect(markup.indexOf('Reversed')).toBeLessThan(markup.indexOf('Symbolism'));
    expect(markup).toContain('<h3');
  });

  it('leaves out the sections it is not given and sets the heading level', () => {
    const markup = html(<MeaningPanel upright="Time alone." headingLevel={2} />);
    expect(markup).toContain('<h2');
    expect(markup).not.toContain('Reversed');
    expect(markup).not.toContain('Symbolism');
  });

  it('replaces text that is still being written with a quiet note', () => {
    const markup = html(
      <MeaningPanel
        upright="TODO"
        isPending={(text) => text === 'TODO'}
        pendingText="Still being written."
      />,
    );
    expect(markup).toContain('Still being written.');
    expect(markup).not.toContain('TODO');
  });
});

describe('Divider', () => {
  it('renders each variant as a separator', () => {
    for (const variant of ['rule', 'sprig', 'star'] as const) {
      expect(html(<Divider variant={variant} />)).toContain('role="separator"');
    }
  });
});
