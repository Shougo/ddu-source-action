import {
  Action,
  ActionFlags,
  Actions,
  BaseActionParams,
  BaseKind,
  DduItem,
  DduOptions,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v3.6.0/deps.ts";

export type ActionData = {
  action: string;
  name: string;
  items: DduItem[];
};

type Params = Record<string, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    do: async (args: {
      denops: Denops;
      items: DduItem[];
      kindParams: Params;
      actionParams: unknown;
    }) => {
      const name = (args.items[0].action as ActionData).name;

      args.denops.dispatcher.pop(name, {
        quit: false,
        sync: true,
      });
      await args.denops.dispatcher.event(name, "close");

      for (const item of args.items) {
        const action = item?.action as ActionData;
        await args.denops.call(
          "ddu#ui_sync_action",
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

  override async getPreviewer(args: {
    denops: Denops;
    options: DduOptions;
    item: DduItem;
  }): Promise<Previewer | undefined> {
    const itemAction = args.item?.action as ActionData;
    const action = await args.denops.dispatcher.getItemAction(
      itemAction.name,
      itemAction.items,
      itemAction.action,
    ) as Action<BaseActionParams>;

    if (typeof action != "object" || !action.description) {
      return undefined;
    }

    return {
      kind: "nofile",
      contents: [action.description],
    };
  }

  override params(): Params {
    return {};
  }
}
