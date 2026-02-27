export default function Footer({ connected }) {
  return (
    <footer className="dp-footer">
      <div className="dp-footer-left">
        <a href="#" className="dp-footer-link">PRIVACY POLICY</a>
        <a href="#" className="dp-footer-link">HELP CENTER</a>
        <a href="https://github.com" className="dp-footer-link" target="_blank" rel="noreferrer">GITHUB REPO</a>
      </div>
      <div className="dp-footer-right">
        <span className="dp-footer-version">AIRDROP WEB DESKTOP V2.4.0-STABLE</span>
        {connected && (
          <>
            <span className="dp-footer-sep">|</span>
            <span className="dp-footer-network">LOCAL NETWORK: ACTIVE</span>
          </>
        )}
      </div>
    </footer>
  );
}
