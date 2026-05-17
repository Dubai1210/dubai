// 每日名言
(function() {
  var quotes = [
    '生活不止眼前的苟且，还有诗和远方。',
    '人生就像一盒巧克力，你永远不知道下一块会是什么味道。',
    '世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。',
    '不忘初心，方得始终。',
    '愿你出走半生，归来仍是少年。',
    '你若盛开，清风自来。',
    '梦想，可以天花乱坠，理想，是我们一步一个脚印踩出来的坎坷道路。',
    '人生如逆旅，我亦是行人。',
    '凡是过去，皆为序章。',
    '世界以痛吻我，要我报之以歌。',
    '黑夜无论怎样悠长，白昼总会到来。',
    '生活不是等待暴风雨过去，而是学会在雨中跳舞。',
    '所有的失去，都会以另一种方式归来。',
    '人生没有白走的路，每一步都算数。',
    'The only way to do great work is to love what you do.',
    'Stay hungry, stay foolish.'
  ];

  var el = document.getElementById('daily-quote');
  if (!el) return;

  var today = new Date();
  var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  var index = seed % quotes.length;
  el.textContent = quotes[index];
})();
</script>
