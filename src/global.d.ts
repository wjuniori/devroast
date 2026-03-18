import type { Value, Format } from "number-flow";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "number-flow": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: Value;
          format?: Format;
          locales?: Intl.LocalesArgument;
          numberPrefix?: string;
          numberSuffix?: string;
          nonce?: string;
        },
        HTMLElement
      >;
    }
  }
}
