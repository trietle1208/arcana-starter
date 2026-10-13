/** Phase 0 stand-in for a screen that arrives in a later phase. */
export function PagePlaceholder({ title, phase }: { title: string; phase: number }) {
  return (
    <>
      <h1 className="ar-h1" style={{ fontSize: 28, lineHeight: '34px' }}>
        {title}
      </h1>
      <p className="ar-muted" style={{ margin: 0 }}>
        This screen is built in Phase {phase}.
      </p>
    </>
  );
}
