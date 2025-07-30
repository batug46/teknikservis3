import React from 'react';
import { 
  Shield, Users, Award, Clock, Target, Eye, Laptop, Camera, 
  ShieldCheck, Monitor, Zap, CheckCircle, Star, TrendingUp,
  Building, Heart, Globe, ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  const services = [
    {
      icon: Laptop,
      title: "Bilgisayar ve Notebook Tamiri",
      description: "Tüm marka ve modellerde profesyonel tamir hizmeti"
    },
    {
      icon: Camera,
      title: "Güvenlik Kamera Sistemleri", 
      description: "IP kameralar, analog sistemler ve görüntü analizi"
    },
    {
      icon: ShieldCheck,
      title: "Alarm Sistemleri",
      description: "Kablosuz alarm, sensörler ve akıllı güvenlik çözümleri"
    },
    {
      icon: Monitor,
      title: "Donanım ve Yazılım Çözümleri",
      description: "Sistem kurulumu, konfigürasyon ve optimizasyon"
    }
  ];

  const advantages = [
    {
      icon: Clock,
      title: "13 Yıllık Deneyim",
      description: "Sektörde edindiğimiz tecrübe ile en zorlu problemlere bile çözüm üretiyoruz.",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
    },
    {
      icon: Users,
      title: "Uzman Ekip", 
      description: "Alanında uzman teknisyenlerimizle profesyonel hizmet sunuyoruz.",
      color: "bg-green-100 dark:bg-green-900/30 text-green-600"
    },
    {
      icon: Award,
      title: "Kalite Garantisi",
      description: "Tüm hizmetlerimizde müşteri memnuniyetini garanti ediyoruz.",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
    }
  ];



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-300 rounded-full opacity-25 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <Building className="w-10 h-10" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Efe Bilgisayar ve
                <br />
                <span className="text-blue-300">Güvenlik Sistemleri</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                2010 yılından bu yana teknoloji dünyasında güvenilir çözümler sunuyoruz
              </p>
      </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-blue-100">
              <div className="flex items-center">
                <Heart className="w-6 h-6 mr-3 text-blue-300" />
                <div>
                  <div className="font-semibold text-white">Güvenilir Hizmet</div>
                  <div className="text-sm">13 yıldır kesintisiz</div>
                </div>
              </div>
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-3 text-blue-300" />
                <div>
                  <div className="font-semibold text-white">Geniş Hizmet Ağı</div>
                  <div className="text-sm">Ankara genelinde</div>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-3 text-blue-300" />
                <div>
                  <div className="font-semibold text-white">Kalite Garantisi</div>
                  <div className="text-sm">%100 müşteri memnuniyeti</div>
                </div>
              </div>
        </div>
          </div>
        </div>
      </section>



            {/* About Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-8">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  Hakkımızda
                </span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Teknolojide Güvenilir Ortağınız
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Efe Bilgisayar ve Güvenlik Sistemleri olarak, 2010 yılından bu yana teknoloji dünyasında güvenilir çözümler sunuyoruz.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Bilgisayar tamiri, güvenlik sistemleri kurulumu ve teknolojik danışmanlık alanlarında uzman ekibimizle, müşterilerimize en kaliteli hizmeti sunmayı hedefliyoruz. Her projede en yüksek standartları koruyarak, müşteri memnuniyetini ön planda tutuyoruz.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Müşteri Memnuniyeti</div>
                      <div className="text-gray-600 dark:text-gray-300">%98 memnuniyet oranı</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Hızlı Çözüm</div>
                      <div className="text-gray-600 dark:text-gray-300">24 saat içinde yanıt</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Hizmetlerimiz</h3>
                <div className="space-y-6">
                  {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                  <div>
                          <h4 className="font-semibold mb-1">{service.title}</h4>
                          <p className="text-blue-100 text-sm">{service.description}</p>
                        </div>
                  </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Avantajlarımız
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Neden Bizi Tercih Etmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sektörde edindiğimiz deneyim ve uzman ekibimizle size en iyi hizmeti sunuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group-hover:-translate-y-2">
                    <div className={`w-16 h-16 ${advantage.color} dark:bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{advantage.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{advantage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              Değerlerimiz
            </span>
            <h2 className="text-4xl font-bold mb-6">Misyonumuz ve Vizyonumuz</h2>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Misyonumuz</h3>
                </div>
                <p className="text-blue-100 leading-relaxed text-lg">
                    Müşterilerimize en yüksek kalitede teknolojik çözümler sunarak, güvenlik ve bilişim ihtiyaçlarını en iyi şekilde karşılamak. Her zaman güncel teknolojileri takip ederek, en iyi hizmeti en uygun fiyatlarla sunmak.
                  </p>
                <div className="mt-6 flex items-center text-blue-200">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="text-sm">Sürekli gelişim ve iyileştirme</span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Vizyonumuz</h3>
                </div>
                <p className="text-purple-100 leading-relaxed text-lg">
                    Bölgemizde teknoloji ve güvenlik sistemleri alanında lider firma olmak. Sürekli gelişen teknolojiye ayak uydurarak, müşterilerimize en yenilikçi çözümleri sunmak ve sektörde örnek gösterilen bir kuruluş haline gelmek.
                  </p>
                <div className="mt-6 flex items-center text-purple-200">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="text-sm">İnovasyon ve liderlik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Teknoloji İhtiyaçlarınız İçin Bize Ulaşın
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Uzman ekibimizle projelerinizi hayata geçirmeye hazırız. 
            Size en uygun çözümü birlikte bulalım.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Güvenilir Servis</h3>
              <p className="text-blue-100">Tüm hizmetlerimizde kalite garantisi</p>
            </div>
            <div>
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Uzman Ekip</h3>
              <p className="text-blue-100">Alanında deneyimli teknisyenler</p>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">Hızlı Çözüm</h3>
              <p className="text-blue-100">En kısa sürede probleminizi çözüyoruz</p>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
} 