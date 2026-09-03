// MongoDB her kaydı "_id" alanında tutar. Arayüzler "id" alanını beklediği
// için JSON'a çevirirken alan adını değiştiriyoruz.
const jsonAyarlari = {
  versionKey: false,
  transform: function (belge, nesne) {
    nesne.id = nesne._id.toString();
    delete nesne._id;
    return nesne;
  },
};

module.exports = { jsonAyarlari };
