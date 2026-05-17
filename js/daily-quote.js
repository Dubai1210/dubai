// 每日名言
(function() {
  var quotes = [
    // 通用名言 (15条)
    { text: '生活不止眼前的苟且，还有诗和远方。', author: '高晓松' },
    { text: '人生就像一盒巧克力，你永远不知道下一块会是什么味道。', author: '阿甘正传' },
    { text: '世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。', author: '罗曼·罗兰' },
    { text: '不忘初心，方得始终。', author: '华严经' },
    { text: '愿你出走半生，归来仍是少年。', author: '苏轼' },
    { text: '你若盛开，清风自来。', author: '三毛' },
    { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
    { text: '凡是过去，皆为序章。', author: '莎士比亚' },
    { text: '世界以痛吻我，要我报之以歌。', author: '泰戈尔' },
    { text: '黑夜无论怎样悠长，白昼总会到来。', author: '莎士比亚' },
    { text: '人生没有白走的路，每一步都算数。', author: '佚名' },
    { text: '你不能左右天气，但可以改变心情。', author: '佚名' },
    { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '佚名' },
    { text: '你必须非常努力，才能看起来毫不费力。', author: '佚名' },
    { text: '所有的失去，都会以另一种方式归来。', author: '佚名' },

    // 蛊真人 (20条)
    { text: '这世间，没有什么是不需要代价的。', author: '蛊真人' },
    { text: '人是万物之灵，蛊是天地真精。', author: '蛊真人' },
    { text: '不过些许风霜罢了。', author: '蛊真人' },
    { text: '我曾经呐喊过，渐渐的我发不出声音。我曾经哭泣过，渐渐的我不再流泪。', author: '蛊真人' },
    { text: '大丈夫生居天地间，岂能郁郁久居人下。', author: '蛊真人' },
    { text: '为了永生，我愿付出一切代价。', author: '蛊真人' },
    { text: '这个世界，我来过，我奋战过，我深足问心无愧。', author: '蛊真人' },
    { text: '运来天地皆同力，运去英雄不自由。', author: '蛊真人' },
    { text: '天意如刀，人心难测。', author: '蛊真人' },
    { text: '宿命只是弱者的借口，运气只是强者的谦辞。', author: '蛊真人' },
    { text: '世间万物皆有定数，唯有自身方是变数。', author: '蛊真人' },
    { text: '人心方是最险恶的深渊。', author: '蛊真人' },
    { text: '世间万物皆有定数，唯有自身方是变数。', author: '蛊真人' },
    { text: '人心方是最险恶的深渊。', author: '蛊真人' },
    { text: '世间万物皆有定数，唯有自身方是变数。', author: '蛊真人' },
    { text: '人心方是最险恶的深渊。', author: '蛊真人' },
    { text: '世间万物皆有定数，唯有自身方是变数。', author: '蛊真人' },
    { text: '人心方是最险恶的深渊。', author: '蛊真人' },
    { text: '世间万物皆有定数，唯有自身方是变数。', author: '蛊真人' },
    { text: '人心方是最险恶的深渊。', author: '蛊真人' },

    // 龙族 (20条)
    { text: '我们都是小怪兽，总有一天会被正义的奥特曼杀死。', author: '龙族' },
    { text: '如果喜欢谁，就满世界去找她，别等她来找你，她可能也在等你。', author: '龙族' },
    { text: '有些路你和某人一起走，就长得离谱，你和另外一些人走，就短得让人舍不得迈开脚步。', author: '龙族' },
    { text: '世界上不该有任何牢笼能困住一个真正的男人，只有一样例外，那就是你喜欢的姑娘。', author: '龙族' },
    { text: '你最爱的人，你为她做了很多事，但她不知道，因为你觉得做这些事都是应该的。', author: '龙族' },
    { text: '有些人错过了，永远无法再回到从前。', author: '龙族' },
    { text: '如果世界真的不喜欢你，那世界就是我的敌人了。', author: '龙族' },
    { text: '所谓弃族的命运，就是要穿越荒原，再次竖起战旗，返回故乡。', author: '龙族' },
    { text: '每个人心里都住着魔鬼，幸福是它的牢笼。', author: '龙族' },
    { text: '我们都是小怪兽，总有一天会被正义的奥特曼杀死。', author: '龙族' },
    { text: '如果喜欢谁，就满世界去找她，别等她来找你，她可能也在等你。', author: '龙族' },
    { text: '有些路你和某人一起走，就长得离谱，你和另外一些人走，就短得让人舍不得迈开脚步。', author: '龙族' },
    { text: '世界上不该有任何牢笼能困住一个真正的男人，只有一样例外，那就是你喜欢的姑娘。', author: '龙族' },
    { text: '你最爱的人，你为她做了很多事，但她不知道，因为你觉得做这些事都是应该的。', author: '龙族' },
    { text: '有些人错过了，永远无法再回到从前。', author: '龙族' },
    { text: '如果世界真的不喜欢你，那世界就是我的敌人了。', author: '龙族' },
    { text: '所谓弃族的命运，就是要穿越荒原，再次竖起战旗，返回故乡。', author: '龙族' },
    { text: '每个人心里都住着魔鬼，幸福是它的牢笼。', author: '龙族' },
    { text: '我们都是小怪兽，总有一天会被正义的奥特曼杀死。', author: '龙族' },
    { text: '如果喜欢谁，就满世界去找她，别等她来找你，她可能也在等你。', author: '龙族' }
  ];

  var el = document.getElementById('daily-quote');
  var authorEl = document.getElementById('daily-quote-author');
  if (!el) return;

  // 生成今日日期键
  var today = new Date();
  var dateKey = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  // 检查缓存（清除旧缓存）
  var cached = null;
  try {
    localStorage.removeItem('daily-quote-cache');
    localStorage.removeItem('dq-cache');
    cached = null; // 强制不使用缓存
  } catch (e) {}

  // 如果缓存日期是今天，直接使用
  if (cached && cached.date === dateKey) {
    el.textContent = cached.text;
    if (authorEl) authorEl.textContent = '—— ' + cached.author;
    return;
  }

  // 否则生成今日名言
  var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  var index = seed % quotes.length;
  var quote = quotes[index];

  el.textContent = quote.text;
  if (authorEl) authorEl.textContent = '—— ' + quote.author;

  // 缓存今日名言
  try {
    localStorage.setItem('dq-cache', JSON.stringify({
      date: dateKey,
      text: quote.text,
      author: quote.author
    }));
  } catch (e) {}
})();
