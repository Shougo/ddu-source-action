import {
  type Action,
  ActionFlags,
  type Actions,
  type BaseParams,
  type DduItem,
  type DduOptions,
  type Previewer,
} from "jsr:@shougo/ddu-vim@~10.3.0/types";
import { BaseKind } from "jsr:@shougo/ddu-vim@~10.3.0/kind";

import type { Denops } from "jsr:@denops/core@~7.0.0";

export type ActionData = {
  action: string;
  name: string;
  items: DduItem[];
};

type Params = Record<string, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    do: {
      description: "Execute the action.",
      callback: async (args: {
        denops: Denops;
        items: DduItem[];
        kindParams: Params;
        actionParams: unknown;
      }) => {
        const name = (args.items[0].action as ActionData).name;

        // NOTE: It must quit current ddu
        await args.denops.dispatcher.pop(name, {
          quit: true,
          sync: true,
        });

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
    ) as Action<BaseParams>;

    if (typeof action != "object" || !action.description) {
      return undefined;
    }

    return {
      kind: "nofile",
      contents: action.description.split("\n"),
    };
  }

  override params(): Params {
    return {};
  }
}
