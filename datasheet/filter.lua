-- Turn a docs page into a LaTeX fragment for the datasheet.
-- Options (pandoc -M):
--   idprefix    prefix for heading ids and #links, so ids stay unique across pages
--   only        comma-separated H2 ids: keep just these sections, without their H2 heading
--   except      comma-separated H2 ids: drop these sections
--   spectables  turn each H3 and its bullets into a row of a two-column table

local SITE = 'https://docs.canimal.io'

local function set(meta)
  local s = {}
  for id in pandoc.utils.stringify(meta or ''):gmatch('[^,]+') do s[id] = true end
  return s
end

local function select_sections(blocks, only, except)
  local out, current = {}, nil
  local only_mode = next(only) ~= nil
  for _, b in ipairs(blocks) do
    if b.t == 'Header' and b.level <= 2 then current = b.identifier end
    local keep = (not only_mode or only[current]) and not except[current]
    if keep and not (only_mode and b.t == 'Header' and b.level == 2) then
      out[#out + 1] = b
    end
  end
  return out
end

-- H3 heading plus its bullet list becomes one table row: heading | bullets, one per line.
-- Images are left out; the dimension drawing has its own appendix.
local function spec_tables(blocks)
  local out, rows = {}, nil
  local function flush()
    if rows then
      out[#out + 1] = pandoc.utils.from_simple_table(pandoc.SimpleTable(
        {}, { pandoc.AlignLeft, pandoc.AlignLeft }, { 0.3, 0.7 }, {}, rows))
      rows = nil
    end
  end
  local i = 1
  while i <= #blocks do
    local b = blocks[i]
    if b.t == 'Header' and b.level == 2 then
      local cell = {}
      i = i + 1
      while i <= #blocks and blocks[i].t ~= 'Header' do
        local c = blocks[i]
        if c.t == 'BulletList' then
          for _, item in ipairs(c.content) do
            for _, x in ipairs(item) do cell[#cell + 1] = pandoc.Plain(x.content) end
          end
        elseif not (c.t == 'Para' and #c.content == 1 and c.content[1].t == 'Image') then
          cell[#cell + 1] = c
        end
        i = i + 1
      end
      rows = rows or {}
      rows[#rows + 1] = { { pandoc.Plain(b.content) }, cell }
    else
      flush()
      out[#out + 1] = b
      i = i + 1
    end
  end
  flush()
  return out
end

function Pandoc(doc)
  local prefix = pandoc.utils.stringify(doc.meta.idprefix or '')
  local only = set(doc.meta.only)
  -- H2 becomes \section; with "only", the H2 is dropped and H3 becomes \section.
  local shift = next(only) and 2 or 1
  local blocks = select_sections(doc.blocks, only, set(doc.meta.except))

  blocks = pandoc.Blocks(blocks):walk({
    Header = function(h)
      h.level = h.level - shift
      h.identifier = prefix .. '-' .. h.identifier
      return h
    end,
    Link = function(l)
      if l.target:match('^#') then
        l.target = '#' .. prefix .. '-' .. l.target:sub(2)
        return l
      end
      if l.target:match('^/') then l.target = SITE .. l.target end
      -- Print readers can't click: put the address in a footnote.
      if pandoc.utils.stringify(l.content) ~= l.target then
        return { l, pandoc.Note({ pandoc.Plain({ pandoc.Link(l.target, l.target) }) }) }
      end
      return l
    end,
    Image = function(img)
      if img.src:match('^/assets/') then img.src = 'public' .. img.src end
      return img
    end,
    CodeBlock = function(cb)
      local env = cb.classes[1] == 'text' and 'outputblock' or 'codeblock'
      return pandoc.RawBlock('latex', '\\begin{' .. env .. '}\n' .. cb.text .. '\n\\end{' .. env .. '}')
    end,
  })

  if doc.meta.spectables then blocks = spec_tables(blocks) end
  return pandoc.Pandoc(blocks, {})
end
