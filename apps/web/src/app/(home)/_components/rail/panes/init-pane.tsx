import HeroPane from "./hero-pane";
import InstallPane from "./install-pane";
import LiveFeed from "./live-feed";
import StatsPane from "./stats-pane";

function Divider() {
  return <span aria-hidden="true" className="h-px w-full bg-fd-border" />;
}

export default function InitPane({ showLiveData }: { showLiveData: boolean }) {
  return (
    <>
      <HeroPane />
      <Divider />
      <InstallPane />
      {showLiveData ? (
        <>
          <Divider />
          <StatsPane />
          <LiveFeed />
        </>
      ) : null}
    </>
  );
}
