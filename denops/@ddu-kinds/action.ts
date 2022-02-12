import {
  Actions,
  ActionFlags,
  BaseKind,
  DduItem,
} from "https://deno.land/x/ddu_vim@v0.12.0/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v0.12.0/deps.ts";

export type ActionData = {
  action: string;
  name: string;
  items: DduItem[];
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  actions: Actions<Params> = {
    do: async (args: { denops: Denops; items: DduItem[] }) => {
      await args.denops.call(
        "ddu#pop",
        (args.items[0].action as ActionData).name,
      );

      for (const item of args.items) {
        const action = item?.action as ActionData;
        await args.denops.call(
          "ddu#item_action",
          action.name,
          action.action,
          action.items,
          {},
        );
      }

      return Promise.resolve(ActionFlags.Persist);
    },
  };

  params(): Params {
    return {};
  }
}
