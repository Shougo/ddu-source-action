import {
  type Context,
  type DduItem,
  type DduOptions,
  type Item,
} from "jsr:@shougo/ddu-vim@~10.2.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~10.2.0/source";

import { type ActionData } from "../@ddu-kinds/action.ts";

import type { Denops } from "jsr:@denops/core@~7.0.0";

import { is } from "jsr:@core/unknownutil@~4.3.0/is";

type Params = {
  actions: string[];
  ignoredActions: string[];
  name: string;
  items: DduItem[];
};

export class Source extends BaseSource<Params> {
  override kind = "action";

  override gather(args: {
    denops: Denops;
    context: Context;
    options: DduOptions;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const actions = await args.denops.dispatcher.getItemActions(
          args.options.name,
          args.sourceParams.items,
        ) as Record<string, unknown>;
        const actionNames = Object.keys(actions).filter((action) =>
          args.sourceParams.ignoredActions.indexOf(action) < 0
        );

        controller.enqueue(actionNames.map((actionName) => {
          const action = actions[actionName];
          const description = is.Record(action)
            ? (action.description as string).replace("\n", " ")
            : "";

          return {
            word: description.length === 0
              ? actionName
              : `${actionName} : ${description}`,
            highlights: [{
              name: "actionName",
              hl_group: "Statement",
              col: 1,
              width: actionName.length,
            }],
            action: {
              action: actionName,
              name: args.sourceParams.name,
              items: args.sourceParams.items,
            },
          };
        }));
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      actions: [],
      ignoredActions: [],
      name: "default",
      items: [],
    };
  }
}
