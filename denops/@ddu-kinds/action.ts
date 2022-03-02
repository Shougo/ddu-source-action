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
    do: async (args: {
      denops: Denops;
      items: DduItem[],
      actionParams: unknown
    }) => {
      const name = (args.items[0].action as ActionData).name;

      await args.denops.call("ddu#pop", name);
      await args.denops.call("ddu#event", name, "close");

      for (const item of args.items) {
        const action = item?.action as ActionData;
        await args.denops.call(
          "ddu#ui_action",
          action.name,
          "itemAction",
          {
            name: action.action,
            items: action.items,
            params: args.actionParams,
          },
        );
      }

      return Promise.resolve(ActionFlags.None);
    },
  };

  params(): Params {
    return {};
  }
}
