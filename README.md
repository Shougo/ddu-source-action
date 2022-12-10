# ddu-source-action

action source for ddu.vim

This source collects actions from items.

Note: It must be called from UI plugin.
Note: The UI plugin must implement "itemAction" UI action.
Note: It does not close current UI.

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### ddu.vim

https://github.com/Shougo/ddu.vim

## Configuration

```vim
call ddu#custom#patch_global(#{
    \   kindOptions: #{
    \     action: #{
    \       defaultAction: 'do',
    \     },
    \   }
    \ })
```
