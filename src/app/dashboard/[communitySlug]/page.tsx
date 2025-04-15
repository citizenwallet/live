'use server';

import DashboardPage from '@/containers/DashboardPage';
import { ConfigService } from '@citizenwallet/sdk';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
interface props {
  params: {
    communitySlug: string;
  };
  searchParams: {
    collectiveSlug: string;
    showHeader: string;
    from: string;
  };
}

export default async function Page({
  params: { communitySlug },
  searchParams: { collectiveSlug, showHeader, from },
}: props) {
  const configService = new ConfigService();

  const configs = await configService.get(true);
  const config = configs.find(
    (config) => config.community.alias === communitySlug
  );

  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage
        communityConfig={config}
        collectiveSlug={collectiveSlug}
        from={from}
        title={`${communitySlug} Dashboard`}
      />
      <Footer />
    </Suspense>
  );
}
