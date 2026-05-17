// 每日名言
(function() {
  var quotes = {
    // 通用名言 (15条)
    general: [
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
      { text: '人生没有白走的路，每一步都算数。', author: '李宗盛' },
      { text: '你不能左右天气，但可以改变心情。', author: '佚名' },
      { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '佚名' },
      { text: '你必须非常努力，才能看起来毫不费力。', author: '李欣频' },
      { text: '所有的失去，都会以另一种方式归来。', author: '佚名' }
    ],

    // 蛊真人 (20条)
    guzhenren: [
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
      { text: '我本微末凡尘，却心向天空。', author: '蛊真人' },
      { text: '不疯魔，不成活。', author: '蛊真人' },
      { text: '天道无常，人道无常，唯有我道永恒。', author: '蛊真人' },
      { text: '成王败寇，自古皆然。', author: '蛊真人' },
      { text: '我命由我不由天。', author: '蛊真人' },
      { text: '纵使万劫不复，我亦义无反顾。', author: '蛊真人' },
      { text: '天地不仁，以万物为刍狗。', author: '蛊真人' },
      { text: '道在人为，路在脚下。', author: '蛊真人' }
    ],

    // 龙族 (20条)
    longzu: [
      { text: '我们都是小怪兽，总有一天会被正义的奥特曼杀死。', author: '龙族' },
      { text: '如果喜欢谁，就满世界去找她，别等她来找你，她可能也在等你。', author: '龙族' },
      { text: '有些路你和某人一起走，就长得离谱，你和另外一些人走，就短得让人舍不得迈开脚步。', author: '龙族' },
      { text: '世界上不该有任何牢笼能困住一个真正的男人，只有一样例外，那就是你喜欢的姑娘。', author: '龙族' },
      { text: '你最爱的人，你为她做了很多事，但她不知道，因为你觉得做这些事都是应该的。', author: '龙族' },
      { text: '有些人错过了，永远无法再回到从前。', author: '龙族' },
      { text: '如果世界真的不喜欢你，那世界就是我的敌人了。', author: '龙族' },
      { text: '所谓弃族的命运，就是要穿越荒原，再次竖起战旗，返回故乡。', author: '龙族' },
      { text: '每个人心里都住着魔鬼，幸福是它的牢笼。', author: '龙族' },
      { text: '你陪了我多少年，花开花落，一路上起起跌跌。', author: '龙族' },
      { text: '孤独的人不会伤害别人，只会不断地伤害自己罢了。', author: '龙族' },
      { text: '这个世上没有什么事是不能舍弃的，如果有，那就再加把劲。', author: '龙族' },
      { text: '没有人逃得过悲伤，悲伤才是最大的魔鬼。', author: '龙族' },
      { text: '死并不可怕，可怕的是没有意义的活着。', author: '龙族' },
      { text: '世界上最悲催的事，是你暗恋某个女孩，而她开心地和另外一个人在一起。', author: '龙族' },
      { text: '命运这种东西，生来就是要被踏于足下的。', author: '龙族' },
      { text: '在这个世界上，最让人恐惧的，不是死亡，而是没有希望的活着。', author: '龙族' },
      { text: '你不懂那种感觉，十几年了，谁也不觉得你有多重要，谁也不关心你今天干了什么。', author: '龙族' },
      { text: '如果喜欢谁，就满世界去找她，别等她来找你，她可能也在等你。', author: '龙族' },
      { text: '我总是忍不住回想起那座城市的夜晚，灯光燃成的篝火。', author: '龙族' }
    ]
  };

  var el = document.getElementById('daily-quote');
  var authorEl = document.getElementById('daily-quote-author');
  if (!el) return;

  // 合并所有名言
  var allQuotes = quotes.general.concat(quotes.guzhenren, quotes.longzu);

  // 生成今日日期键（每天固定显示同一句）
  var today = new Date();
  var dateKey = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  // 使用日期作为种子生成固定的随机索引
  var seed = 0;
  for (var i = 0; i < dateKey.length; i++) {
    seed = ((seed << 5) - seed) + dateKey.charCodeAt(i);
    seed = seed & seed; // 转换为 32 位整数
  }
  var index = Math.abs(seed) % allQuotes.length;

  var quote = allQuotes[index];

  // 添加淡入动画
  el.style.opacity = '0';
  el.style.transform = 'translateY(10px)';
  el.textContent = quote.text;

  if (authorEl) {
    authorEl.style.opacity = '0';
    authorEl.textContent = '—— ' + quote.author;
  }

  // 触发动画
  requestAnimationFrame(function() {
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';

    if (authorEl) {
      setTimeout(function() {
        authorEl.style.transition = 'opacity 0.6s ease';
        authorEl.style.opacity = '1';
      }, 200);
    }
  });
})();
