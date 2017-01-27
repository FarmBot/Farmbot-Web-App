# This is a module that generates cool names like "billowing-raindrop-48".
# We originally used the usmanbashir/haikunator gem, but forked the code to begin
# more "plant friendly".
module Haikunator
  class << self
    def haikunate(token_range = 9999, delimiter = "-")
      build(token_range, delimiter)
    end

    private

    def build(token_range, delimiter)
      sections = [
        adjectives.sample,
        nouns.sample,
        token(token_range)
      ]

      sections.compact.join(delimiter)
    end

    def token(range)
      SecureRandom.random_number(range) if range > 0
    end

    def adjectives
      %w(
        autumn hidden bitter misty silent empty dry dark summer
        icy delicate quiet white cool spring winter patient
        twilight dawn crimson wispy weathered blue billowing
        broken cold damp falling frosty green long late lingering
        bold little morning muddy old red rough still small
        sparkling throbbing shy wandering withered wild black
        young holy solitary fragrant aged snowy proud floral
        restless divine polished ancient purple lively nameless
        abaxial acropetal aculeate acuminate adaxial adnate
        aerial alate alternate annual anticlinal apiculate
        appressed areolate aristate articulate asymmetrical
        attenuate axile axillary barbed barbellate basal
        basifixed basipetal biennial bifoliate bilabiate
        bilateral biloculate binomial bipinnate biternate
        bracteate bracteolate bullate calyculate campanulate
        canaliculate capillary capitate caudate centrifixed
        channelled circinate clathrate clavate cochleate compressed
        conduplicate connate contorted cordate costapalmate
        crenate crenulate crisped cucullate cuneate cupulate
        cuspidate cylindrical declinate decorticate decussate
        deflexed dentate denticulate determinate digitate
        dissected distal diurnal divaricate dorsal dorsifixed
        dorsiventral ebracteate emarginate endophloeodal ephemeral
        epinecral epiphloedal exserted exstipulate extrastaminal
        falcate fasciculate faveolate faucal felted fenestrate
        fertile fimbriate flabellate foliate foveolate furcate
        fused guttulate halonate hastate imbricate imparipinnate
        incised included incurved indeterminate induplicate inflated
        inflexed inrolled inserted intercalary intramarginal intrastaminal
        isobifacial jugary labiate lacerate laciniate laminal lanceolate
        lateral ligulate loculicidal longicidal lunate lyrate maculate marginal
        monopodial mucronate muricate naturalised nectary obcordate oblanceolate
        obligate obovate oval ovary ovate paleate palmate papilionate parietal
        paripinnate pectinate pedate peltate penicillate perennial perfoliate
        perforate periclinal petal petiolate pinnate plicate pluriovulate
        poricidal prostrate proximal pseudoverticillate pulvinate punctate
        pustulate pyramidal quadrate radial radiate radical recurved reduplicate
        reflexed resupinate reticulate rhomboidal rostrate rotate ruderal
        rudimentary ruminate runcinate saccate sagittate scrobiculate seed
        sepal septicidal seriate serrate serrulate sessile sinuate solitary
        spiral stellate sterile stipitate stipulate striate
        subulate sulcate superficial suspended sympodial symmetrical
        tepal terminal ternate terrestrial tetragonal toothed trinerved
        triplinerved trullate truncate tuberculate tufted tunicate turbinate
        umbonate uncinate undulate uniserial uniseriate urceolate valvate
        variegated ventral versatile verticillate vestigial virgate weed zonate
      )
    end

    def nouns
      %w(waterfall river breeze moon rain wind sea morning
        snow lake sunset pine shadow leaf dawn glitter forest
        hill cloud meadow sun glade bird brook butterfly
        bush dew dust field fire flower firefly feather grass
        haze mountain night pond darkness snowflake silence
        sound sky shape surf thunder violet water wildflower
        wave water resonance sun wood dream cherry tree fog
        frost voice paper frog smoke star )
    end
  end
end