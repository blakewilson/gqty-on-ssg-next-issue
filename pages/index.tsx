import { PropsWithServerCache } from "@gqty/react";
import { GetStaticProps } from "next";
import {
  PageIdType,
  prepareReactRender,
  useHydrateCache,
  useQuery,
} from "../gqty";

type PageProps = PropsWithServerCache<{}>;

export default function Home({ cacheSnapshot }: PageProps) {
  useHydrateCache({
    cacheSnapshot,
    shouldRefetch: false,
  });

  const { blocks } = useQuery().page({
    id: `2`,
    idType: PageIdType.DATABASE_ID,
  });

  return (
    <div>
      {/* This works as expected:
      The query for this union is executed server side and
      the result is added to the cache snapshot */}
      {/* <div
        dangerouslySetInnerHTML={{
          __html: blocks[0]?.$on.CoreParagraphBlock?.originalContent,
        }}
      /> */}

      {/* This does not work as expected:
      The query for this union is executed server side, but the
      result is not added to the cache snapshot. It is then re-requested
      on the client side. */}
      {blocks.map((block, index) => {
        switch (block.name) {
          case "core/paragraph": {
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{
                  __html: block?.$on.CoreParagraphBlock?.originalContent,
                }}
              />
            );
          }
        }
      })}
    </div>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async (_ctx) => {
  const { cacheSnapshot } = await prepareReactRender(<Home />);

  return {
    props: {
      cacheSnapshot,
    },
  };
};
