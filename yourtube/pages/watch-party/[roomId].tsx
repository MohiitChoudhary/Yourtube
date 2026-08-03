import WatchPartyRoom from "@/components/watchparty/WatchPartyRoom";

interface WatchPartyPageProps {
  roomId: string;
}

export default function WatchPartyPage({
  roomId,
}: WatchPartyPageProps) {
  return (
    <WatchPartyRoom
      roomId={roomId}
    />
  );
}

export async function getServerSideProps(
  context: any
) {
  const { roomId } = context.params;

  return {
    props: {
      roomId,
    },
  };
}