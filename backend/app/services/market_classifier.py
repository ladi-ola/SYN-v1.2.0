from __future__ import annotations

import re
from typing import ClassVar

from app.core.logging import get_logger

logger = get_logger(__name__)

SynCategory = str

CATEGORY_POLITICS: SynCategory = "Politics"
CATEGORY_SPORTS: SynCategory = "Sports"
CATEGORY_CRYPTO: SynCategory = "Crypto"
CATEGORY_ENTERTAINMENT: SynCategory = "Entertainment"
CATEGORY_WORLD_EVENTS: SynCategory = "World Events"
CATEGORY_OTHERS: SynCategory = "Others"

_POLITICS_PATTERNS = [
    r"\bpresident(?:ial)?\b", r"\belection\b", r"\bcongress\b", r"\bsenate\b",
    r"\bgovernor\b", r"\bmayor\b", r"\bcabinet\b", r"\bsecretary of\b",
    r"\bnominee\b", r"\bnomination\b", r"\bprimary\b", r"\bcaucus\b",
    r"\bcampaign\b", r"\bcandidate\b", r"\bdemocrat(?:ic)?\b", r"\brepublican\b",
    r"\bgop\b", r"\bdnc\b", r"\brnc\b", r"\btrump\b", r"\bbiden\b",
    r"\bwhite house\b", r"\bexecutive order\b", r"\bimpeach(?:ment)?\b",
    r"\bscotus\b", r"\bsupreme court\b", r"\bpardoned\b", r"\bpardon\b",
    r"\bindict(?:ment|ed)?\b", r"\blegislation\b", r"\blegislature\b",
    r"\bcongress(?:ional)?\b", r"\bparliament\b", r"\bprime minister\b",
    r"\bchancellor\b", r"\bminister\b", r"\bambassador\b", r"\bdiplomat(?:ic)?\b",
    r"\bsanctions?\b", r"\btariffs?\b", r"\btrade war\b", r"\btreaty\b",
    r"\bpolitical\b", r"\bpolitician\b", r"\bpoll(?:ing|s)?\b", r"\bapproval rating\b",
    r"\bnato\b", r"\bunited nations\b", r"\bun security\b", r"\bgovernment\b",
    r"\bfederal\b", r"\bstate of the union\b", r"\bmidterms?\b", r"\breferendum\b",
    r"\bhome secretary\b", r"\bforeign secretary\b",
    r"\bdefence secretary\b", r"\bdefense secretary\b", r"\battorney general\b",
    r"\bvice president\b", r"\bfirst minister\b", r"\bselect committee\b",
    r"\bparliamentary\b", r"\bgeneral election\b", r"\bby-election\b",
    r"\bgovernorship\b", r"\bsenatorial\b", r"\bgovern(?:ing|ment)\s", r"\blegislative\b",
    r"\bconstitutional\b", r"\bregime\b", r"\bcoup\b", r"\binsurrection\b",
    r"\bprotest\b", r"\bstrikes?\b", r"\bunion\b", r"\bact (?:president|governor)\b",
    r"\bEU\b", r"\bEuropean Union\b", r"\bBrexit\b",
    r"\bUK\b.*\b(?:election|parliament|prime minister|referendum|vote|politics|political|government)\b",
    r"\bUnited Kingdom\b.*\b(?:election|parliament|prime minister|vote)\b",
    r"\b(?:leave|join|remain in) the EU\b",
]

_SPORTS_PATTERNS = [
    r"\bnfl\b", r"\bnba\b", r"\bmlb\b", r"\bnhl\b", r"\bmls\b", r"\bufc\b",
    r"\bwwe\b", r"\bformula 1\b", r"\bf1\b", r"\bnascar\b", r"\bindycar\b",
    r"\bpremier league\b", r"\bla liga\b", r"\bserie a\b", r"\bbundesliga\b",
    r"\bligue 1\b", r"\bfifa\b", r"\buefa\b", r"\bchampions league\b",
    r"\beuropa league\b", r"\bcopa\b", r"\bworld cup\b", r"\bsuper bowl\b",
    r"\bworld series\b", r"\bstanley cup\b", r"\bmarch madness\b",
    r"\bnba finals?\b", r"\bplayoffs?\b", r"\bchampionship\b",
    r"\bgrand slam\b", r"\bwimbledon\b", r"\bus open\b", r"\bmasters\b",
    r"\btour de france\b", r"\bolympic(?:s)?\b", r"\bolympiad\b",
    r"\b(?:football|soccer|basketball|baseball|hockey|tennis|golf|cricket|rugby|boxing|mma)\b",
    r"\b(?:mixed martial arts)\b", r"\bracing\b", r"\bcycl(?:ing|ist)\b",
    r"\bswim(?:ming)?\b", r"\btrack and field\b", r"\bathlet(?:ic|e)s?\b",
    r"\b(?:quarterback|touchdown|home run|goal (?:scorer|keeper)|hat.trick|penalty kick|free kick|corner kick|red card|yellow card|offside|goalkeeper)\b",
    r"\b(?:knockout|tko|submission|title fight|weigh-in|pound.for.pound)\b",
    r"\b(?:sprint|marathon|triathlon)\b", r"\bvs\b.*\b(?:O/U|over.?under)\b",
    r"\b(?:both teams to score)\b", r"\bfinal score\b", r"\bpoint spread\b",
    r"\bwin the (?:game|match|tournament|cup|title|series)\b",
    r"\bchampions?\b", r"\bmvp\b", r"\bpro bowl\b", r"\ball.star\b",
    r"\bdraft (?:pick|position|lottery|order)\b", r"\btrade deadline\b",
    r"\btransfer window\b", r"\bfree agent\b", r"\bsigning\b", r"\brookie\b",
    r"\bcoach(?:ing)?\b", r"\bmanager\b", r"\bmanagerial\b", r"\bwin the (?:super bowl|world cup|champions league|stanley cup)\b",
    r"\bscore\b", r"\bscores?\b", r"\bvegas odds\b",
]

_CRYPTO_PATTERNS = [
    r"\bbitcoin\b", r"\bbtc\b", r"\bethereum\b", r"\beth\b", r"\bsolana\b",
    r"\bsol\b", r"\bdogecoin\b", r"\bdoge\b", r"\bxrp\b", r"\bcardano\b", r"\bada\b",
    r"\bpolkadot\b", r"\bdot\b", r"\bavalanche\b", r"\bavax\b", r"\bchainlink\b",
    r"\buniswap\b", r"\baave\b", r"\bpolygon\b", r"\bmatic\b",
    r"\bcryptocurren(?:cy|cies)\b", r"\bcrypto\b", r"\bblockchain\b",
    r"\bdefi\b", r"\bnft\b", r"\bnon.fungible token\b", r"\bstablecoin\b",
    r"\bdex\b", r"\bdecentrali[sz]ed exchange\b", r"\btoken\b", r"\bairdropped\b",
    r"\bstaking\b", r"\bdao\b", r"\bweb3\b", r"\blayer 2\b", r"\bl2\b",
    r"\bhash ?rate\b", r"\bhalving\b", r"\bmining\b", r"\bminer\b",
    r"\bbinance\b", r"\bcoinbase\b", r"\bmarket ?cap\b.*\b(?:btc|bitcoin|crypto|eth)\b",
    r"\b(?:btc|bitcoin|crypto|eth|ethereum) (?:price|ETF|reserve)\b",
    r"\bcrypto.*\bETF\b", r"\bETF\b.*\bcrypto\b", r"\bdigital (?:asset|currency)\b",
    r"\bstrategic (?:bitcoin|btc|crypto) reserve\b",
    r"\bTether\b", r"\bUSDT\b", r"\bUSDC\b",
]

_ENTERTAINMENT_PATTERNS = [
    r"\b(?:movie|film)\b", r"\bbox office\b", r"\bnetflix\b", r"\bdisney\b",
    r"\bhbo\b", r"\bamazon prime\b", r"\bmarvel\b", r"\bdc (?:universe|comics)\b",
    r"\bstar wars\b", r"\bstar trek\b", r"\bharry potter\b",
    r"\boscars?\b", r"\bemmy\b", r"\bgolden globes?\b", r"\bgrammy\b",
    r"\bacademy award\b", r"\bbafta\b", r"\bsag award\b", r"\btony award\b",
    r"\b(?:album|single|track) (?:release|drop)\b", r"\bnew album\b",
    r"\btour\b", r"\bconcert\b", r"\bfestival\b", r"\bbillboard\b",
    r"\b(?:rapper|singer|musician|band|artist|dj|producer)\b",
    r"\b(?:actor|actress|director|celebrity|influencer)\b",
    r"\bvideo game\b", r"\bGTA\b", r"\bGrand Theft Auto\b",
    r"\bFortnite\b", r"\bMinecraft\b", r"\bPlayStation\b", r"\bPS5\b",
    r"\bXbox\b", r"\bNintendo\b", r"\bSwitch\b", r"\bSteam\b",
    r"\bTwitch\b", r"\bE3\b", r"\bGame Awards?\b", r"\besports?\b",
    r"\b(?:TikTok|YouTube|Instagram|Twitter|X)\b.*\b(?:ban|acqui|follower|subscriber|video|post|trend)\b",
    r"\bsocial media\b", r"\bmeme\b", r"\bviral\b", r"\btrending\b",
    r"\b(?:TV show|TV series|season (?:premiere|finale)|episode)\b",
    r"\breality (?:TV|show)\b", r"\bdocumentary\b", r"\btalk show\b",
    r"\banime\b", r"\bmanga\b", r"\bpodcast\b", r"\bstreaming\b",
    r"\bconcert tour\b", r"\bcoachella\b", r"\bburning man\b",
    r"\bRihanna\b", r"\bKanye\b", r"\bTaylor Swift\b", r"\bBeyonc[/]i\b",
    r"\bDrake\b", r"\bKendrick\b", r"\bMrBeast\b",
    r"\bfashion\b", r"\bmet gala\b", r"\brunway\b",
    r"\bJames Bond\b", r"\b007\b", r"\bBond (?:franchise|movie|film|actor|character)\b",
]

_WORLD_EVENTS_PATTERNS = [
    r"\bGDP\b", r"\binflation\b", r"\brecession\b", r"\binterest rate\b",
    r"\b(?:federal reserve|the fed)\b", r"\bcentral bank\b", r"\bECB\b",
    r"\b(?:stock market|S&P 500|NASDAQ|Dow Jones)\b",
    r"\b(?:oil|gold|silver|copper|crude|commodity) (?:price|futures|market)\b",
    r"\b(?:bond|treasury) (?:market|yield|price|trading|rate|curve|auction|issuance)\b",
    r"\byield\b", r"\btreasury\b", r"\bunemployment\b",
    r"\b(?:jobs? report|non.farm payrolls?|NFP)\b",
    r"\bearthquake\b", r"\bhurricane\b", r"\btornado\b", r"\btsunami\b",
    r"\bflood(?:ing)?s?\b", r"\bwildfire\b", r"\bvolcan(?:o|ic)\b",
    r"\bpandemic\b", r"\boutbreak\b", r"\bepidemic\b", r"\bpublic health emergency\b",
    r"\bclimate change\b", r"\bglobal warming\b", r"\bcarbon\b", r"\bemissions\b",
    r"\b(?:temperature|weather) record\b", r"\bel nino\b", r"\bla nina\b",
    r"\bwar\b", r"\bconflict\b", r"\binvasion\b", r"\bceasefire\b",
    r"\b(?:terrorist|terrorism)\b", r"\bmissile\b", r"\bdrone strike\b",
    r"\b(?:NASA|SpaceX|space)\b", r"\b(?:Mars|moon) (?:landing|mission)\b",
    r"\basteroid\b", r"\bscientifi?c breakthrough\b", r"\bdiscovery\b",
    r"\b(?:border|crossing|migrant|immigration|asylum|refugee)\b",
    r"\bearthquake\b", r"\bvolcanic eruption\b", r"\bSolar eclipse\b",
    r"\bLunar eclipse\b", r"\bcomet\b",
    r"\bWTO\b", r"\bIMF\b", r"\bWorld Bank\b", r"\bG7\b", r"\bG20\b",
    r"\bbeige book\b", r"\bCPI\b", r"\bPPI\b", r"\bconsumer confidence\b",
    r"\bearnings\b", r"\bmarket crash\b", r"\bbull market\b", r"\bbear market\b",
    r"\bbankruptcy\b", r"\bbailout\b", r"\bdefault\b", r"\bdebt ceiling\b",
]

_CATEGORY_RULES: list[tuple[str, list[str]]] = [
    (CATEGORY_CRYPTO, _CRYPTO_PATTERNS),
    (CATEGORY_SPORTS, _SPORTS_PATTERNS),
    (CATEGORY_WORLD_EVENTS, _WORLD_EVENTS_PATTERNS),
    (CATEGORY_POLITICS, _POLITICS_PATTERNS),
    (CATEGORY_ENTERTAINMENT, _ENTERTAINMENT_PATTERNS),
]


class MarketClassifier:
    _compiled: ClassVar[list[tuple[str, list[re.Pattern[str]]]]] = []

    @classmethod
    def _ensure_compiled(cls) -> None:
        if cls._compiled:
            return
        for category, patterns in _CATEGORY_RULES:
            compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
            cls._compiled.append((category, compiled))
        logger.info("classifier_initialized", rules=len(_CATEGORY_RULES))

    @classmethod
    def classify(
        cls, question: str, group_title: str | None = None, event_title: str | None = None
    ) -> SynCategory:
        cls._ensure_compiled()

        text = question
        if group_title:
            text = f"{text} {group_title}"
        if event_title:
            text = f"{text} {event_title}"

        for category, patterns in cls._compiled:
            for pattern in patterns:
                if pattern.search(text):
                    return category

        return CATEGORY_OTHERS

    @classmethod
    def categories(cls) -> list[SynCategory]:
        return [
            CATEGORY_POLITICS,
            CATEGORY_SPORTS,
            CATEGORY_CRYPTO,
            CATEGORY_ENTERTAINMENT,
            CATEGORY_WORLD_EVENTS,
            CATEGORY_OTHERS,
        ]
