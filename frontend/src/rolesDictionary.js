// 角色图鉴数据字典
export const ROLES_DICTIONARY = {

  lord: {
    name: '主公',
    color: '#f1c40f',
    camp: '主公阵营',
    description: '消灭所有反贼和内奸，平定天下。主公身份开局全场公开。',
    spritePosition: '0% 0%'
  },
  loyalist: {
    name: '忠臣',
    color: '#2ecc71',
    camp: '主公阵营',
    description: '保护主公，协助主公消灭反贼和内奸。',
    spritePosition: '100% 0%'
  },
  rebel: {
    name: '反贼',
    color: '#e74c3c',
    camp: '反贼阵营',
    description: '推翻主公统治，击败主公即获得胜利。',
    spritePosition: '0% 100%'
  },
  renegade: {
    name: '内奸',
    color: '#9b59b6',
    camp: '内奸阵营',
    description: '消灭除自己外所有人，最后击败主公。',
    spritePosition: '100% 100%'
  },
  werewolf: {
    name: '狼人',
    image: '/static/cards/werewolf.png',
    spritePosition: '33.333% 0%',
    color: '#c0392b',
    camp: '狼人阵营',
    description: '每晚醒来，与同伴确认身份。如场上只有一只狼，可查看中央一张底牌。',
    advancedTip: '高阶玩法：如果是孤狼，优先查看中央牌确认是否有神职；如果有狼队友，白天可互相打配合，但注意不要过于默契暴露身份。发言时可以假装预言家或其他神职混淆视听。'
  },

  minion: {
    name: '爪牙',
    image: '/static/cards/minion.png',
    spritePosition: '100% 0%',
    color: '#8e44ad',
    camp: '狼人阵营',
    description: '每晚醒来，得知场上所有狼人的位置，但狼人不知道你的身份。',
    advancedTip: '高阶玩法：你的任务是帮助狼人获胜。白天可以假跳神职为狼人背书，或故意引导好人投错票。即使你被投死，只要狼人活着就算胜利。注意不要过早暴露自己的爪牙身份。'
  },

  mason: {
    name: '守夜人',
    image: '/static/cards/mason.png',
    spritePosition: '0% 33.333%',
    color: '#16a085',
    camp: '好人阵营',
    description: '每晚醒来，寻找另一名守夜人互相确认身份。如果您是唯一的守夜人，则无同伴。',
    advancedTip: '高阶玩法：必须与另一名守夜人共同进退。可以通过特定的发言暗示找到彼此。如果您是单守夜人，可以直接报身份占据主导。'
  },

  seer: {
    name: '预言家',
    image: '/static/cards/seer.png',
    spritePosition: '66.666% 33.333%',
    color: '#2980b9',
    camp: '好人阵营',
    description: '每晚醒来，可以查看一名玩家的底牌，或查看中央两张底牌。',
    advancedTip: '高阶玩法：验人优先选择发言可疑的玩家；如果局势不明朗，查中央牌可以排除狼坑。白天报验人信息时，注意观察被验玩家的反应，真狼会露出破绽。可以故意藏一手验人结果，后置发言打信息差。'
  },

  robber: {
    name: '强盗',
    image: '/static/cards/robber.png',
    spritePosition: '33.333% 33.333%',
    color: '#d35400',
    camp: '好人阵营',
    description: '每晚醒来，可选择一名玩家交换底牌，并查看自己换回的新底牌。',
    advancedTip: '高阶玩法：换牌后你即为新身份，如果换到狼人，白天需要以狼人身份发言并保护原狼人（现在的强盗）。如果不确定目标身份，可以先不跳强盗，听一圈发言后再决定是否爆出换牌信息。'
  },

  troublemaker: {
    name: '捣蛋鬼',
    image: '/static/cards/troublemaker.png',
    spritePosition: '100% 33.333%',
    color: '#f39c12',
    camp: '好人阵营',
    description: '每晚醒来，可选择两名其他玩家交换底牌，但不查看交换后的牌。',
    advancedTip: '高阶玩法：你可以轻易打乱狼人的阵型。白天可以先不报自己换了谁，观察这两人的发言，如果有人跳神职，再跳出来说自己换了他们，让场上局势瞬间反转。'
  },

  drunk: {
    name: '酒鬼',
    image: '/static/cards/drunk.png',
    spritePosition: '0% 66.666%',
    color: '#1abc9c',
    camp: '好人阵营',
    description: '每晚醒来，必须将自己的底牌与中央的一张牌交换，但不查看新牌。',
    advancedTip: '高阶玩法：你不知道自己的最终身份，因此发言需要谨慎。可以装作平民或其他神职，观察场上局势。如果有人跳出你换走的那张中央牌的身份，你可以暗中判断其真伪。'
  },

  insomniac: {
    name: '失眠者',
    image: '/static/cards/insomniac.png',
    spritePosition: '33.333% 66.666%',
    color: '#34495e',
    camp: '好人阵营',
    description: '每晚最后醒来，查看自己的底牌是否在夜晚被其他玩家换走。',
    advancedTip: '高阶玩法：你是掌握全场最终信息的关键。如果底牌没变，可以直接报出；如果变成了其他牌（如狼人），则需要根据新身份的胜利条件灵活调整发言和投票。'
  },

  villager: {
    name: '平民',
    image: '/static/cards/villager.png',
    spritePosition: '100% 66.666%',
    color: '#7f8c8d',
    camp: '好人阵营',
    description: '夜晚不醒来。白天依靠推理和发言找出狼人。',
    advancedTip: '高阶玩法：平民虽然没有技能，但可以作为场上的逻辑基点。可以通过敏锐的听觉和逻辑分析，揪出狼人的逻辑漏洞。必要时可以穿神职的衣服为真神职挡刀。'
  },

  hunter: {
    name: '猎人',
    image: '/static/cards/hunter.png',
    spritePosition: '66.666% 66.666%',
    color: '#27ae60',
    camp: '好人阵营',
    description: '夜晚不醒来。如果被投票出局，被你投票的玩家也将随你一起出局。',
    advancedTip: '高阶玩法：你是好人阵营的强力反击点。白天可以表现得强势一些，吸引狼人投票给你。投票时务必准确认定心中的狼人，确保能带走真正的敌人。'
  },

  tanner: {
    name: '皮匠',
    image: '/static/cards/tanner.png',
    spritePosition: '0% 100%',
    color: '#d35400',
    camp: '独立阵营',
    description: '夜晚不醒来。你的胜利条件是：在白天被投票出局。',
    advancedTip: '高阶玩法：想尽一切办法让自己看起来像狼人！可以故意发言有漏洞、乱穿神职衣服、或者和公认的好人互怼。但演得太过火可能会被识破是皮匠而被无视，分寸感是关键。'
  },

  doppelganger: {
    name: '化身幽灵',
    image: '/static/cards/doppelganger.png',
    spritePosition: '33.333% 100%',
    color: '#bdc3c7',
    camp: '未知阵营',
    description: '夜晚第一个醒来，查看一名玩家的底牌并立刻获得该角色的能力和阵营。',
    advancedTip: '高阶玩法：如果你看到了狼人，你就是狼人；如果看到了神职，就在你的回合执行该神职的动作。你拥有最灵活的操作空间，但也最容易引起场上混乱。'
  }
};

export const CAMP_COLORS = {
  '狼人阵营': '#c0392b',
  '好人阵营': '#2980b9',
  '独立阵营': '#d35400',
  '未知阵营': '#bdc3c7',
  '邪恶阵营': '#8e44ad',
  '正义阵营': '#f1c40f'
};

export const AVALON_ROLES_DICTIONARY = {
  merlin: {
    name: '梅林',
    spritePosition: '4.04% 20.98%',
    color: '#f1c40f',
    camp: '正义阵营',
    description: '你看到了所有邪恶阵营的玩家（除莫德雷德外），但你要隐藏身份，不能被刺客发现。',
    advancedTip: '暗中引导好人做对任务，切忌表现得太有视角。'
  },
  percival: {
    name: '派西维尔',
    spritePosition: '34.74% 20.84%',
    color: '#3498db',
    camp: '正义阵营',
    description: '你看到了梅林和莫甘娜，但你不知道谁是真的梅林。',
    advancedTip: '观察这两人的行为，找出真梅林并保护他，或假扮梅林吸引刺客。'
  },
  loyal: {
    name: '亚瑟的忠臣',
    spritePosition: '65.81% 20.84%',
    color: '#2ecc71',
    camp: '正义阵营',
    description: '你没有任何特殊视角，依靠推理找出邪恶阵营。',
    advancedTip: '通过投票和任务结果分析谁是坏人。'
  },
  morgana: {
    name: '莫甘娜',
    spritePosition: '4.23% 96.96%',
    color: '#e74c3c',
    camp: '邪恶阵营',
    description: '你对派西维尔假扮梅林，试图迷惑他。',
    advancedTip: '表现得像梅林一样有视角，干扰派西维尔的判断。'
  },
  assassin: {
    name: '刺客',
    spritePosition: '35.11% 96.96%',
    color: '#8e44ad',
    camp: '邪恶阵营',
    description: '如果好人完成3次任务，你可以在最后指认梅林，指认正确则邪恶阵营反败为胜。',
    advancedTip: '在做任务的同时，仔细观察谁在带队且有视角，锁定梅林。'
  },
  oberon: {
    name: '奥伯伦',
    spritePosition: '65.99% 96.82%',
    color: '#2c3e50',
    camp: '邪恶阵营',
    description: '你看不到其他邪恶阵营，其他邪恶阵营也看不到你。',
    advancedTip: '你只能靠自己隐藏，有时你的行为可能会意外干扰到狼队友。'
  },
  mordred: {
    name: '莫德雷德',
    spritePosition: '96.69% 96.82%',
    color: '#c0392b',
    camp: '邪恶阵营',
    description: '梅林看不到你，你是隐藏最深的邪恶头目。',
    advancedTip: '利用你对梅林隐身的优势，大胆地潜伏在好人团队中。'
  },
  minion_avalon: {
    name: '莫德雷德的爪牙',
    spritePosition: '35.11% 96.96%',
    color: '#9b59b6',
    camp: '邪恶阵营',
    description: '你知道其他邪恶阵营的玩家（奥伯伦除外），一起破坏任务。',
    advancedTip: '配合队友投出失败票，但要注意隐藏自己。'
  }
};
