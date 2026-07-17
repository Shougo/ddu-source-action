import {
  type Action,
  ActionFlags,
  type Actions,
  type BaseParams,
  type DduItem,
  type DduOptions,
  type Previewer,
} from "@shougo/ddu-vim/types";
import { BaseKind } from "@shougo/ddu-vim/kind";

import type { Denops } from "@denops/std";

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
        if (args.items.length === 0) {
          return ActionFlags.None;
        }

        const firstAction = args.items[0]?.action as
          | Partial<ActionData>
          | undefined;
        if (!firstAction?.name) {
          return ActionFlags.None;
        }

        // NOTE: It must quit current ddu
        await args.denops.dispatcher.pop(firstAction.name, {
          quit: true,
          sync: true,
        });

        for (const item of args.items) {
          const action = item?.action as Partial<ActionData> | undefined;
          if (!action?.name || !action.action || !action.items) {
            continue;
          }

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

        return ActionFlags.None;
      },
    },
  };

  override async getPreviewer(args: {
    denops: Denops;
    options: DduOptions;
    item: DduItem;
  }): Promise<Previewer | undefined> {
    const itemAction = getItemActionData(args.item);
    if (!itemAction) {
      return undefined;
    }

    const action = await args.denops.dispatcher.getItemAction(
      itemAction.name,
      itemAction.items,
      itemAction.action,
    ) as Action<BaseParams> | undefined;

    const description = getActionDescription(action);
    if (!description) {
      return undefined;
    }

    return {
      kind: "nofile",
      contents: description.split("\n"),
    };
  }

  override params(): Params {
    return {};
  }
}

function getActionDescription(
  action: Action<BaseParams> | undefined,
): string | undefined {
  if (!action || typeof action !== "object") {
    return undefined;
  }

  if (!action.description) {
    return undefined;
  }

  return action.description;
}

function getItemActionData(item: DduItem): ActionData | undefined {
  const action = item?.action as Partial<ActionData> | undefined;
  if (!action?.name || !action.action || !action.items) {
    return undefined;
  }

  return action as ActionData;
}
