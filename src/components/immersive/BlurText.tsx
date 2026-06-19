type Props = {
  text: string;
  className?: string;
  /** Number of leading words rendered in the ember accent gradient. */
  accent?: number;
};

/**
 * Splits text into words, each blurring/rising in with a staggered delay
 * (CSS `.blur-word`). Reduced-motion users get the final state immediately via
 * the global reduced-motion stylesheet rule.
 */
export function BlurText({ text, className, accent = 0 }: Props) {
  const words = text.split(' ');
  return (
    <p
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={'blur-word' + (i < accent ? ' text-ember' : '')}
          style={{ animationDelay: `${0.3 + (i * 100) / 1000}s` }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
