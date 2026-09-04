# Future forum integration: evidence and proposal

Read-only research checked 4 September 2026. This is a bounded compatibility study, not a popularity ranking or a commitment to build or publish an integration. No accounts, posts, plugins, or hosted replay links were created.

## What people actually post

| Community / section | Verified example | Observed format and implication |
| --- | --- | --- |
| Two Plus Two, No Limit Tournaments | [Sunday Warm up 22$ PKO, 9 February 2026](https://twoplustwo.com/No-Limit-Tournaments/13tr4/Sunday-Warm-up-22-PKO?isFirstNewPost=true) | Raw PokerStars header, seats, antes and preflop actions, cut off at the decision. Replies disagree about positions. A replayer must label this incomplete rather than invent the rest. |
| Two Plus Two, Online No-Limit Hold'em Cash | [2NL Zoom - 3b pot OOP, 23 November 2025](https://forumserver.twoplustwo.com/69/online-no-limit-holdem-cash/2nl-zoom-3b-pot-oop-1853009/) | Converted position/stack/street text with card images and a Pokeit replay link. Search indexing exposed this post; direct retrieval failed during this check. Treat it as observed indexed evidence, not a tested embed capability. |
| r/poker, Hand Analysis | [Was this a good fold?, 31 August 2026](https://www.reddit.com/r/poker/comments/1w2yt6h/was_this_a_good_fold/) | Image attachment plus a short question and analysis in comments. A readable static preview is useful even when readers never open another site. |
| r/poker | [Hand analysis for 1/3 NL Holdem, 30 May 2026](https://www.reddit.com/r/poker/comments/1trqaoz/hand_analysis_for_13_nl_holdem/) | Two manually narrated hands with suit emoji, approximate stacks and street amounts. This is not machine-complete PokerStars input. |
| r/Poker_Theory | [Online hand suspecion, 22 March 2026](https://www.reddit.com/r/Poker_Theory/comments/1s0tf02/online_hand_suspecion/) | A PokerStars hand recounted in prose, board emoji and big blinds; the author separately obtained the raw history. Preserve the distinction between notes and an exported log. |
| CardsChat, cash-game hand analysis | [Section listing](https://www.casino.us/cardschat/cash-game-hand-analysis-50/) | Separate threads label stakes, game and table size. The retrieved listing includes 2026 discussions. No editor/embedding capability was verified. |

The [May 2026 r/poker tools megathread](https://www.reddit.com/r/poker/comments/1t4ixxh/may_i_built_a_poker_tool_app_calendar_megathread/) also contains a developer sharing a direct replay URL and describing text export. That proves link-based promotion exists in this designated thread; it does not establish acceptance in every hand-analysis post or independently validate the advertised product.

## Platform limits and recommended next phase

Reddit documents rich-text and Markdown posts/comments, including hyperlinks, code blocks and tables in its [official formatting guide](https://support.reddithelp.com/hc/en-us/articles/360043033952-Formatting-Guide). An arbitrary third-party iframe/JavaScript replay inside a normal post is **not established by that documentation**. Plan for a normal link plus readable text and, where the community permits it, a static image. Do not promise automatic rich previews: rendering and moderation must be checked on the actual target subreddit and client.

Two Plus Two currently has both legacy `forumserver.twoplustwo.com` and newer `twoplustwo.com` pages. Observed replay links and formatted hands support a link/text path. Custom iframe, oEmbed, BBCode extension and external-script support remain **unverified**. Only propose an inline embed after the forum administrator confirms a supported mechanism and a sandbox test succeeds. CardsChat needs the same administrator/editor check.

Recommended sequence for a later, separately approved phase:

1. Choose one forum/subreddit and confirm its rules and moderator expectations. Keep the current parser's complete-English-PokerStars boundary visible.
2. Design an opt-in anonymization preview, removing names, hand/table/tournament identifiers, dates and incidental chat before sharing. Let the user inspect the exact public payload.
3. Add copyable street text and a static preview first. Preserve game, stakes, effective stacks, position, action, decision point and whether the hand is incomplete.
4. If hosting is later approved, add a stable replay link with an explicit reveal policy and a useful text fallback. Decide retention/deletion and privacy before sending histories to a server.
5. Add an embed only on platforms that explicitly support it, with accessible fallback text and mobile testing. No real forum plugin is part of phase one.

These examples establish several posting styles, not market demand, traffic rank, partnership interest or universal platform permissions.
