import Link from "next/link";

function HomePage(request) {
  return (
    <div className="container mx-auto max-w-screen-sm m-4 p-3">
      <h1>Monitor transactions on the blockchain</h1>
      <p>
        Just append <code>/:chain/:tokenAddress</code> to the URL
      </p>
      <ul>
        <li>
          <Link href="/celo/cEUR">/celo/cEUR</Link>
        </li>
        <li>
          <Link href="/base/OAK">/base/oak</Link>
        </li>
        <li>
          <Link href="/polygon/EURe">/polygon/EURe</Link>
        </li>
        <li>
          <Link href="/polygon/ZINNE">/polygon/ZINNE</Link>
        </li>
      </ul>
    </div>
  );
}

export default HomePage;
